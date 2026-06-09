from datetime import datetime

from sqlalchemy import Column, Integer, String, Float, Text, Boolean, JSON, DateTime
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(80), unique=True, nullable=False, index=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="user")
    created_at = Column(DateTime, default=datetime.utcnow)


class Destination(Base):
    __tablename__ = "destinations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    cluster = Column(String(100), nullable=False)
    alt_name = Column(String(200))
    region = Column(String(100))
    altitude_min = Column(Integer)
    altitude_max = Column(Integer)
    terrain = Column(String(100))
    duration_min = Column(Integer)
    duration_max = Column(Integer)
    cost_per_day_npr = Column(Float)
    cost_per_day_usd = Column(Float)
    difficulty = Column(String(50))
    best_seasons = Column(JSON)
    activities = Column(JSON)
    permits = Column(JSON)
    description = Column(Text)
    highlights = Column(JSON)
    image_url = Column(String(500))
    requires_guide = Column(Boolean, default=False)
    ams_risk = Column(String(50))
    fitness_level = Column(String(50))
    match_score = Column(Float, default=0.0)


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), index=True)
    budget = Column(Float)
    budget_currency = Column(String(10), default="USD")
    duration = Column(Integer)
    travel_dates = Column(String(50))
    season = Column(String(50))
    interests = Column(JSON)
    fitness_level = Column(String(50))
    travel_type = Column(String(50))
    nationality = Column(String(100))
    starting_city = Column(String(100), default="Kathmandu")
    accommodation_type = Column(String(50), default="mid")
    created_at = Column(String(50))
    completed = Column(Boolean, default=False)


class Itinerary(Base):
    __tablename__ = "itineraries"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), index=True)
    destination_id = Column(Integer)
    days = Column(JSON)
    total_cost = Column(Float)
    total_cost_npr = Column(Float)
    emergency_buffer = Column(Float)
    created_at = Column(String(50))
