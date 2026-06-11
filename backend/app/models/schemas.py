import re
from datetime import datetime

from pydantic import BaseModel, field_validator
from typing import List, Optional


EMAIL_RE = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
NAME_RE = re.compile(r"^[a-zA-Z][a-zA-Z .'\-]{1,48}[a-zA-Z.]$")


class UserCreate(BaseModel):
    username: str
    email: str
    password: str

    @field_validator('username')
    @classmethod
    def validate_username(cls, v: str) -> str:
        if not NAME_RE.match(v):
            raise ValueError('Username must be a valid name (letters, spaces, dots, hyphens only, 3-50 characters)')
        return v

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        if not EMAIL_RE.match(v):
            raise ValueError('Invalid email format')
        return v

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one digit')
        return v


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None

    @field_validator('username')
    @classmethod
    def validate_username(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not NAME_RE.match(v):
            raise ValueError('Username must be a valid name (letters, spaces, dots, hyphens only, 3-50 characters)')
        return v

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not EMAIL_RE.match(v):
            raise ValueError('Invalid email format')
        return v

    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if len(v) < 8:
                raise ValueError('Password must be at least 8 characters')
            if not re.search(r'[A-Z]', v):
                raise ValueError('Password must contain at least one uppercase letter')
            if not re.search(r'[a-z]', v):
                raise ValueError('Password must contain at least one lowercase letter')
            if not re.search(r'[0-9]', v):
                raise ValueError('Password must contain at least one digit')
        return v


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


class TokenRefresh(BaseModel):
    access_token: str
    token_type: str = "bearer"


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


class TripHistoryCreate(BaseModel):
    destination_name: str
    budget_total: float = 0
    budget_currency: str = "NPR"
    duration_days: Optional[int] = None
    accommodation: Optional[str] = None
    preferences_snapshot: Optional[dict] = None
    breakdown: Optional[List[dict]] = None


class TripHistoryOut(BaseModel):
    id: int
    user_id: int
    destination_name: str
    budget_total: float
    budget_currency: str
    duration_days: Optional[int] = None
    accommodation: Optional[str] = None
    preferences_snapshot: Optional[dict] = None
    breakdown: Optional[list] = None
    created_at: datetime

    class Config:
        from_attributes = True
