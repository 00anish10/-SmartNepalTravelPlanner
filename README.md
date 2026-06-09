# Nepal Trek AI

AI-powered travel planner for Nepal. Personalized itineraries, safety protocols, and budget tracking for Himalayan adventures.

Built with **FastAPI** + **React 19** + **PostgreSQL** + **scikit-learn**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python), SQLAlchemy 2.0, Pydantic v2 |
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS v4 |
| State | Zustand, TanStack React Query v5 |
| Routing | React Router DOM v7 |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| ML | scikit-learn (TF-IDF, K-Means, Decision Tree) |
| Database | PostgreSQL 16 |
| Animations | Framer Motion v12 |
| Containerization | Docker Compose |

---

## Features

### Core AI Engines
- **Content-Based Recommender** — TF-IDF vectorization + cosine similarity matching user preferences to 40+ destinations
- **Greedy Itinerary Optimizer** — Day-by-day scheduling with altitude constraints, acclimatization rules, and budget tracking
- **Difficulty Classifier** — Decision tree evaluating altitude, terrain, and ascent rate for accurate grading
- **Destination Clusterer** — K-Means (5 clusters: High Himalayan, Cultural, Wildlife, Adventure, Remote)

### User Features
- Interactive preference elicitation wizard
- Personalized destination recommendations with similarity scores
- Side-by-side destination comparison (up to 3)
- AI-generated day-by-day trek itineraries
- Budget estimation with 15% emergency buffer and permit fee calculations
- Safety reports with AMS risk assessment and evacuation info
- AMS (Acute Mountain Sickness) self-assessment tool (Lake Louise scoring)
- Interactive packing checklist with local NPR prices
- Nepal travel guide with weather, visa info, festivals, and emergency contacts

### Authentication & Security
- JWT-based authentication with bcrypt password hashing
- Server restart invalidation — all sessions expire on backend restart
- Auto-logout on 401 responses (stale/invalid tokens)
- Route protection (protected and admin-only routes)
- Password strength indicator
- Show/hide password toggles

### Admin Panel
- CRUD management for destinations

---

## Project Structure

```
SmartNepalTravelPlanner/
├── docker-compose.yml          # PostgreSQL + Backend containers
├── database/
│   └── init.sql                # Schema + seed admin user
├── backend/
│   ├── .env                    # Environment variables
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── run.py
│   └── app/
│       ├── main.py             # FastAPI app, CORS, routes
│       ├── config.py           # App config + server restart ID
│       ├── database.py         # SQLAlchemy engine + session
│       ├── models/
│       │   ├── models.py       # SQLAlchemy ORM models
│       │   └── schemas.py      # Pydantic request/response schemas
│       ├── routes/
│       │   ├── auth.py         # Register, login, JWT validation
│       │   ├── admin.py        # Admin CRUD
│       │   ├── destinations.py
│       │   ├── recommendations.py
│       │   ├── itineraries.py
│       │   ├── budgets.py
│       │   ├── safety.py
│       │   ├── clusters.py
│       │   └── preferences.py
│       ├── services/
│       │   └── destination_service.py
│       ├── ml/
│       │   ├── recommender.py  # TF-IDF + cosine similarity
│       │   ├── clusterer.py    # K-Means clustering
│       │   ├── itinerary.py    # Greedy optimizer
│       │   └── difficulty.py   # Decision tree classifier
│       └── data/
│           └── destinations.json  # 40+ destination profiles
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── main.tsx
        ├── App.tsx             # Routes, navbar, footer, auth guard
        ├── index.css           # Tailwind v4 + custom styles
        ├── types/index.ts
        ├── services/api.ts     # API client + 401 auto-logout
        ├── hooks/
        │   ├── useAuth.tsx     # Auth context + JWT management
        │   └── usePreferencesStore.ts  # Zustand preferences store
        ├── components/
        │   ├── Skeletons.tsx
        │   └── ErrorBoundary.tsx
        └── pages/
            ├── Home.tsx        # Landing page with auth-aware CTAs
            ├── Login.tsx       # Professional login with validation
            ├── Register.tsx    # Registration with password strength
            ├── Admin.tsx       # Admin dashboard (admin only)
            ├── Preferences.tsx
            ├── Recommendations.tsx
            ├── Destinations.tsx
            ├── Itinerary.tsx
            ├── Budget.tsx
            ├── Safety.tsx
            ├── DestinationCompare.tsx
            ├── NepalInfo.tsx
            ├── PackingChecklist.tsx
            └── AMSChecker.tsx
```

---

## API Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | - | Create account |
| POST | `/api/auth/login` | - | Login, returns JWT |
| GET | `/api/auth/me` | ✓ | Get current user |
| GET | `/api/health` | - | Health check |
| GET | `/api/destinations/` | - | List destinations |
| GET | `/api/destinations/{name}` | - | Destination details |
| POST | `/api/preferences/elicit` | - | Submit preferences |
| POST | `/api/recommendations/recommend` | - | Get AI recommendations |
| POST | `/api/itineraries/generate` | - | Generate itinerary |
| GET | `/api/safety/report/{name}` | - | Safety report |
| GET | `/api/budgets/estimate/{name}` | - | Budget estimate |
| GET | `/api/clusters/` | - | Cluster analysis |
| GET | `/api/clusters/{name}` | - | Destination cluster |
| GET | `/api/admin/destinations` | Admin | List all destinations |
| POST | `/api/admin/destinations` | Admin | Create destination |
| PUT | `/api/admin/destinations/{id}` | Admin | Update destination |
| DELETE | `/api/admin/destinations/{id}` | Admin | Delete destination |

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 16 (or Docker)

### Option 1: Docker (PostgreSQL only)
```bash
docker compose up -d db
```

### Option 2: Full Docker setup
```bash
docker compose up --build
```
Backend runs on `http://localhost:8000`, PostgreSQL on port 5432.

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Backend runs on `http://localhost:8000`. API docs at `http://localhost:8000/docs`.

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

### Seed Database
The `database/init.sql` runs automatically on Docker first start. It creates tables and seeds an admin user:

**Admin credentials:** `admin` / `admin123`

---

## Running Without PostgreSQL

The backend gracefully handles database unavailability. It will log a warning and run the API endpoints that don't require DB access.

---

## Auth Architecture

- **JWT tokens** include a `SERVER_RESTART_ID` that changes every time the backend starts
- On server restart, all existing tokens become invalid — users must re-login
- The frontend validates the stored token on app mount via `GET /api/auth/me`
- Any API 401 response triggers automatic logout + redirect to login
- Registration creates an account and redirects to the login page (no auto-login)

---

## AI/ML Engines

| Engine | Algorithm | Purpose |
|--------|-----------|---------|
| Recommender | TF-IDF + Cosine Similarity | Matches user interests to destinations |
| Clusterer | K-Means (k=5) | Groups destinations by features |
| Itinerary | Greedy Optimizer | Builds day-by-day trek schedules |
| Difficulty | Decision Tree | Classifies trek difficulty level |

---

## Scripts

### Frontend
```bash
npm run dev       # Development server
npm run build     # TypeScript check + Vite build
npm run lint      # ESLint
npm run preview   # Preview production build
```
