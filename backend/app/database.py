from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
import logging

from app.config import DATABASE_URL

logger = logging.getLogger(__name__)

db_connected = False

try:
    engine = create_engine(DATABASE_URL, echo=False)
    with engine.connect():
        pass
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db_connected = True
    logger.info(f"Database connected: {DATABASE_URL}")
except Exception as e:
    logger.warning(f"Database connection failed: {e}. Running without DB.")
    engine = None
    SessionLocal = None


class Base(DeclarativeBase):
    pass


def get_db():
    if SessionLocal is None:
        raise RuntimeError("Database not available")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
