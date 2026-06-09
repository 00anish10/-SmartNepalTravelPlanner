from fastapi import APIRouter, HTTPException
from app.models.schemas import PreferenceInput
from app.services.destination_service import get_all_destinations
from app.ml.recommender import ContentBasedRecommender
from app.ml.difficulty import DifficultyClassifier
import uuid

router = APIRouter()
recommender = ContentBasedRecommender()
difficulty_classifier = DifficultyClassifier()


@router.post("/recommend", response_model=dict)
def get_recommendations(prefs: PreferenceInput):
    dests = get_all_destinations()
    if not dests:
        raise HTTPException(status_code=404, detail="No destinations found")

    prefs_dict = prefs.model_dump()
    if not prefs_dict.get("session_id"):
        prefs_dict["session_id"] = str(uuid.uuid4())

    recommendations = recommender.recommend(prefs_dict, dests, top_n=5)

    for rec in recommendations:
        diff_result = difficulty_classifier.classify(rec)
        rec["difficulty"] = diff_result["difficulty"]
        rec["difficulty_explanation"] = diff_result["justification"]

    total_est = sum(
        r.get("cost_per_day_usd", 50) * prefs.duration
        for r in recommendations
    ) / max(len(recommendations), 1)

    warnings = []
    budget = prefs_dict.get("budget", 0)
    if total_est > budget > 0:
        warnings.append(
            f"Estimated total cost (~Rs {total_est * 135:.0f}) exceeds your budget (Rs {budget * 135:.0f}). "
            f"Consider shorter durations or Cultural/Wildlife destinations which are more affordable."
        )
    if prefs_dict.get("fitness_level") in ("sedentary", "moderate") and any(
        r.get("altitude_max", 0) > 4000 for r in recommendations
    ):
        warnings.append(
            "Some recommended destinations exceed 4,000m. "
            "Please prepare with adequate fitness training and review the safety section."
        )
    if any(r.get("requires_guide") for r in recommendations):
        warnings.append(
            "Some destinations require a licensed guide. Budget accordingly (guide: ~Rs 3,375/day)."
        )

    return {
        "session_id": prefs_dict["session_id"],
        "destinations": recommendations,
        "user_preferences": prefs_dict,
        "total_estimated_cost": round(total_est, 2),
        "warnings": warnings,
    }
