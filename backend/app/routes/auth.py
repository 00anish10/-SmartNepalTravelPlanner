import time
from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import User
from app.models.schemas import UserCreate, UserLogin, UserUpdate, UserOut, Token, TokenRefresh, MessageOut
from app.config import SECRET_KEY, SERVER_RESTART_ID

router = APIRouter(prefix="/api/auth", tags=["Auth"])

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

login_attempts: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT_WINDOW = 300
RATE_LIMIT_MAX = 20


def rate_limit(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    attempts = login_attempts[client_ip]
    attempts[:] = [t for t in attempts if now - t < RATE_LIMIT_WINDOW]
    if len(attempts) >= RATE_LIMIT_MAX:
        raise HTTPException(
            status_code=429,
            detail="Too many login attempts. Please try again in 5 minutes.",
        )
    attempts.append(now)

from jose import JWTError, jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "rid": SERVER_RESTART_ID})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Session expired. Please login again.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        rid = payload.get("rid")
        if sub is None or rid is None:
            raise credentials_exception
        if rid != SERVER_RESTART_ID:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Server was restarted. Please login again.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user_id = int(sub)
    except (JWTError, ValueError):
        raise credentials_exception
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return user


@router.post("/register", response_model=MessageOut)
def register(data: UserCreate, db: Session = Depends(get_db)):
    username_exists = db.query(User).filter(User.username == data.username).first()
    if username_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken",
        )
    email_exists = db.query(User).filter(User.email == data.email).first()
    if email_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    hashed = get_password_hash(data.password)
    db_user = User(
        username=data.username,
        email=data.email,
        hashed_password=hashed,
        role="user",
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return MessageOut(message="Account created successfully. Please login to continue.", user=UserOut.model_validate(db_user))


@router.post("/login", response_model=Token)
def login(data: UserLogin, _: None = Depends(rate_limit), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(
        (User.username == data.username) | (User.email == data.username)
    ).first()
    if not db_user or not verify_password(data.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password",
        )
    token = create_access_token({"sub": str(db_user.id)})
    return Token(access_token=token, user=UserOut.model_validate(db_user))


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserOut)
def update_profile(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.username is not None:
        existing = db.query(User).filter(User.username == data.username, User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = data.username

    if data.email is not None:
        existing = db.query(User).filter(User.email == data.email, User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        current_user.email = data.email

    if data.new_password is not None:
        if not data.current_password:
            raise HTTPException(status_code=400, detail="Current password is required to set a new password")
        if not verify_password(data.current_password, current_user.hashed_password):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        current_user.hashed_password = get_password_hash(data.new_password)

    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/refresh", response_model=TokenRefresh)
def refresh_token(current_user: User = Depends(get_current_user)):
    new_token = create_access_token({"sub": str(current_user.id)})
    return TokenRefresh(access_token=new_token)
