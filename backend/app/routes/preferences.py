from fastapi import APIRouter
from app.models.schemas import PreferenceInput

router = APIRouter()


@router.post("/elicit", response_model=dict)
def elicit_preferences(prefs: PreferenceInput):
    return {
        "session_id": prefs.session_id or "new-session",
        "summary": f"Planning a {prefs.duration}-day trip starting from {prefs.starting_city} with interests in {', '.join(prefs.interests)}. Budget: Rs {prefs.budget * 135:.0f}. Season: {prefs.season}. Fitness: {prefs.fitness_level}.",
        "next_step": "Call POST /api/recommendations/recommend with these preferences to get destination suggestions.",
    }
