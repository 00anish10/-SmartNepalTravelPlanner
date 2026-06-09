from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Destination, User
from app.models.schemas import DestinationOut
from app.routes.auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["Admin"])


class DestinationCreate(BaseModel):
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
    best_seasons: Optional[List[str]] = None
    activities: Optional[List[str]] = None
    permits: Optional[List[str]] = None
    description: Optional[str] = None
    highlights: Optional[List[str]] = None
    image_url: Optional[str] = None
    requires_guide: Optional[bool] = False
    ams_risk: Optional[str] = None
    fitness_level: Optional[str] = None


@router.get("/destinations", response_model=List[DestinationOut])
def list_destinations(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return db.query(Destination).all()


@router.post("/destinations", response_model=DestinationOut)
def create_destination(
    data: DestinationCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    dest = Destination(**data.model_dump())
    db.add(dest)
    db.commit()
    db.refresh(dest)
    return dest


@router.put("/destinations/{dest_id}", response_model=DestinationOut)
def update_destination(
    dest_id: int,
    data: DestinationCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    dest = db.query(Destination).filter(Destination.id == dest_id).first()
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(dest, key, value)
    db.commit()
    db.refresh(dest)
    return dest


@router.delete("/destinations/{dest_id}", status_code=204)
def delete_destination(
    dest_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    dest = db.query(Destination).filter(Destination.id == dest_id).first()
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")
    db.delete(dest)
    db.commit()
