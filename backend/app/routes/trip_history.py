from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import TripHistory, User
from app.models.schemas import TripHistoryCreate, TripHistoryOut
from app.routes.auth import get_current_user, require_admin

router = APIRouter(prefix="/api", tags=["Trip History"])


@router.post("/trip-history/save", response_model=TripHistoryOut)
def save_trip_history(
    data: TripHistoryCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    record = TripHistory(
        user_id=user.id,
        destination_name=data.destination_name,
        budget_total=data.budget_total,
        budget_currency=data.budget_currency,
        duration_days=data.duration_days,
        accommodation=data.accommodation,
        preferences_snapshot=data.preferences_snapshot,
        breakdown=data.breakdown,
        created_at=datetime.utcnow(),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/trip-history/my", response_model=List[TripHistoryOut])
def my_trip_history(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return (
        db.query(TripHistory)
        .filter(TripHistory.user_id == user.id)
        .order_by(TripHistory.created_at.desc())
        .all()
    )


@router.get("/admin/users/{user_id}/history", response_model=List[TripHistoryOut])
def admin_user_history(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    records = (
        db.query(TripHistory)
        .filter(TripHistory.user_id == user_id)
        .order_by(TripHistory.created_at.desc())
        .all()
    )
    return records


@router.delete("/trip-history/{history_id}", status_code=204)
def delete_trip_history(
    history_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    record = db.query(TripHistory).filter(TripHistory.id == history_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Trip history not found")
    if record.user_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this record")
    db.delete(record)
    db.commit()
