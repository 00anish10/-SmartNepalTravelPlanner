-- =====================================================
-- Nepal Trek AI - Database Schema
-- Matches backend/app/models/models.py ORM models
-- =====================================================

-- Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Seed admin user (password: admin123)
INSERT INTO users (username, email, hashed_password, role)
VALUES ('admin', 'admin@nepaltrek.ai', '$2b$12$099IwsH6KjG2zcGA3DoJx.d2frVqvCRUMyfBTnl6MGOpEKWdQCc2m', 'admin');

-- Destinations
CREATE TABLE destinations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    cluster VARCHAR(100) NOT NULL,
    alt_name VARCHAR(200),
    region VARCHAR(100),
    altitude_min INTEGER,
    altitude_max INTEGER,
    terrain VARCHAR(100),
    duration_min INTEGER,
    duration_max INTEGER,
    cost_per_day_npr FLOAT,
    cost_per_day_usd FLOAT,
    difficulty VARCHAR(50),
    best_seasons JSONB,
    activities JSONB,
    permits JSONB,
    description TEXT,
    highlights JSONB,
    image_url VARCHAR(500),
    requires_guide BOOLEAN DEFAULT FALSE,
    ams_risk VARCHAR(50),
    fitness_level VARCHAR(50),
    match_score FLOAT DEFAULT 0
);
CREATE INDEX idx_destinations_name ON destinations(name);
CREATE INDEX idx_destinations_cluster ON destinations(cluster);

-- User preferences
CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    budget FLOAT,
    budget_currency VARCHAR(10) DEFAULT 'USD',
    duration INTEGER,
    travel_dates VARCHAR(50),
    season VARCHAR(50),
    interests JSONB,
    fitness_level VARCHAR(50),
    travel_type VARCHAR(50),
    nationality VARCHAR(100),
    starting_city VARCHAR(100) DEFAULT 'Kathmandu',
    accommodation_type VARCHAR(50) DEFAULT 'mid',
    created_at TIMESTAMP DEFAULT NOW(),
    completed BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_user_preferences_session ON user_preferences(session_id);

-- Itineraries
CREATE TABLE itineraries (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    destination_id INTEGER,
    days JSONB,
    total_cost FLOAT,
    total_cost_npr FLOAT,
    emergency_buffer FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_itineraries_session ON itineraries(session_id);

-- Trip history (saved budget plans per user)
CREATE TABLE trip_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    destination_name VARCHAR(200),
    budget_total FLOAT DEFAULT 0,
    budget_currency VARCHAR(10) DEFAULT 'NPR',
    duration_days INTEGER,
    accommodation VARCHAR(50),
    preferences_snapshot JSONB,
    breakdown JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_trip_history_user ON trip_history(user_id);
