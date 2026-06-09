from datetime import datetime

from pydantic import BaseModel
from typing import List, Optional


class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str = "user"


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class MessageOut(BaseModel):
    message: str
    user: UserOut


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class PreferenceInput(BaseModel):
    session_id: Optional[str] = None
    budget: float
    budget_currency: str = "USD"
    duration: int
    travel_dates: Optional[str] = None
    season: str
    interests: List[str]
    fitness_level: str
    travel_type: str
    nationality: str
    starting_city: str = "Kathmandu"
    accommodation_type: str = "mid"


class DestinationOut(BaseModel):
    id: int
    name: str
    cluster: str
    alt_name: Optional[str] = None
    region: Optional[str] = None
    altitude_min: Optional[int] = None
    altitude_max: Optional[int] = None
    terrain: Optional[str] = None
    duration_min: Optional[int] = None
    duration_max: Optional[int] = None
    cost_per_day_npr: Optional[float] = None
    cost_per_day_usd: Optional[float] = None
    difficulty: Optional[str] = None
    best_seasons: Optional[list] = None
    activities: Optional[list] = None
    permits: Optional[list] = None
    description: Optional[str] = None
    highlights: Optional[list] = None
    image_url: Optional[str] = None
    requires_guide: Optional[bool] = None
    ams_risk: Optional[str] = None
    fitness_level: Optional[str] = None
    match_score: Optional[float] = None
    similarity_explanation: Optional[str] = None

    class Config:
        from_attributes = True


class RecommendationResponse(BaseModel):
    destinations: List[DestinationOut]
    user_preferences: PreferenceInput
    total_estimated_cost: Optional[float] = None
    warning: Optional[str] = None


class ItineraryDay(BaseModel):
    day: int
    location: str
    activity: str
    altitude: int
    altitude_gain: int
    est_cost_usd: float
    est_cost_npr: float
    notes: str
    accommodation: Optional[str] = None
    meals: Optional[str] = None


class ItineraryOut(BaseModel):
    session_id: str
    destination_name: str
    days: List[ItineraryDay]
    total_cost: float
    total_cost_npr: float
    emergency_buffer: float
    emergency_buffer_npr: float
    grand_total: float
    grand_total_npr: float
    warnings: Optional[List[str]] = None


class SafetyReport(BaseModel):
    destination_name: str
    difficulty: str
    difficulty_explanation: str
    max_altitude: int
    ams_risk_level: str
    required_acclimatization_days: int
    acclimatization_schedule: List[str]
    recommended_fitness_prep: str
    essential_gear: List[str]
    emergency_evacuation_points: List[str]
    nearest_hospital: str
    safety_flags: List[str]
    permits_required: List[str]


class BudgetBreakdown(BaseModel):
    category: str
    item: str
    cost_usd: float
    cost_npr: float
    notes: Optional[str] = None


class BudgetOut(BaseModel):
    destination_name: str
    breakdown: List[BudgetBreakdown]
    subtotal: float
    subtotal_npr: float
    emergency_buffer_15: float
    emergency_buffer_15_npr: float
    grand_total: float
    grand_total_npr: float
    warnings: Optional[List[str]] = None
