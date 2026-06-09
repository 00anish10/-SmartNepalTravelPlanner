from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import APP_NAME, APP_VERSION
from app.routes import destinations, recommendations, itineraries, safety, budgets, preferences, clusters
from app.routes.auth import router as auth_router
from app.routes.admin import router as admin_router

app = FastAPI(title=APP_NAME, version=APP_VERSION)

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


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "app": APP_NAME,
        "version": APP_VERSION,
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
