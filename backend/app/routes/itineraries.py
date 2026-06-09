from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.models.schemas import PreferenceInput
from app.ml.itinerary import GreedyItineraryOptimizer
from app.services.destination_service import get_all_destinations

router = APIRouter()
optimizer = GreedyItineraryOptimizer()


class ItineraryRequest(BaseModel):
    destination_name: str
    duration: int
    budget: float
    fitness_level: str = "moderate"
    starting_city: str = "Kathmandu"
    session_id: Optional[str] = None
    accommodation_type: str = "mid"


@router.post("/generate", response_model=dict)
def generate_itinerary(request: ItineraryRequest):
    dests = get_all_destinations()
    dest = None
    for d in dests:
        if d["name"].lower() == request.destination_name.lower():
            dest = d
            break

    if not dest:
        raise HTTPException(status_code=404, detail=f"Destination '{request.destination_name}' not found")

    prefs = {
        "duration": request.duration,
        "budget": request.budget,
        "fitness_level": request.fitness_level,
        "starting_city": request.starting_city,
        "accommodation_type": request.accommodation_type,
    }

    result = optimizer.generate(dest, prefs)
    result["session_id"] = request.session_id or "temp-session"
    result["destination_name"] = dest["name"]

    return result
