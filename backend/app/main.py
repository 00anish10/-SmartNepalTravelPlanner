import logging
import re
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import APP_NAME, APP_VERSION, SECRET_KEY
from app.database import engine, Base, SessionLocal, db_connected
from app.models.models import User, TripHistory
from app.routes import destinations, recommendations, itineraries, safety, budgets, preferences, clusters, trip_history
from app.routes.auth import router as auth_router
from app.routes.admin import router as admin_router

logger = logging.getLogger(__name__)

WEAK_KEYS = {'nepal-trek-ai-secret-key-2024', 'secret', 'changeme', 'default', 'password', 'key'}
NAME_RE = re.compile(r"^[a-zA-Z][a-zA-Z .'\-]{1,48}[a-zA-Z.]$")


def cleanup_invalid_users():
    if SessionLocal is None:
        return
    db = SessionLocal()
    try:
        invalid = db.query(User).all()
        for user in invalid:
            if not NAME_RE.match(user.username):
                db.query(TripHistory).filter(TripHistory.user_id == user.id).delete()
                db.delete(user)
                logger.warning("Deleted user %d with invalid username: %r", user.id, user.username)
        db.commit()
    except Exception as e:
        logger.error("Failed to cleanup invalid users: %s", e)
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    if SECRET_KEY in WEAK_KEYS or len(SECRET_KEY) < 20:
        logger.warning("WEAK SECRET_KEY detected! Set a strong SECRET_KEY in production via .env or environment variable.")
    Base.metadata.create_all(bind=engine)
    cleanup_invalid_users()
    yield


app = FastAPI(title=APP_NAME, version=APP_VERSION, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:4173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(preferences.router, prefix="/api/preferences", tags=["Preferences"])
app.include_router(destinations.router, prefix="/api/destinations", tags=["Destinations"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["Recommendations"])
app.include_router(itineraries.router, prefix="/api/itineraries", tags=["Itineraries"])
app.include_router(safety.router, prefix="/api/safety", tags=["Safety"])
app.include_router(budgets.router, prefix="/api/budgets", tags=["Budgets"])
app.include_router(clusters.router, prefix="/api/clusters", tags=["Clusters"])
app.include_router(trip_history.router)


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "app": APP_NAME,
        "version": APP_VERSION,
        "database": "connected" if db_connected else "disconnected",
        "endpoints": [
            "/api/preferences/elicit",
            "/api/destinations/",
            "/api/recommendations/recommend",
            "/api/itineraries/generate",
            "/api/safety/report/{name}",
            "/api/budgets/estimate/{name}",
            "/api/clusters/",
        ],
    }
