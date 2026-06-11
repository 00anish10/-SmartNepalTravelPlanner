from fastapi import APIRouter, HTTPException, Query
from app.services.destination_service import get_destination_by_name
import re

router = APIRouter()


@router.get("/estimate/{destination_name}", response_model=dict)
def budget_estimate(
    destination_name: str,
    duration: int = Query(7, ge=1, le=30),
    accommodation_type: str = Query("mid"),
    guide_porter_required: bool = Query(False),
):
    dest = get_destination_by_name(destination_name)
    if not dest:
        raise HTTPException(status_code=404, detail=f"Destination '{destination_name}' not found")

    breakdown = []
    name = dest["name"].lower()
    cluster = dest.get("cluster", "")
    is_trek = "trek" in cluster.lower() or "himalayan" in cluster.lower()
    is_remote = "remote" in cluster.lower()
    is_wildlife = "wildlife" in cluster.lower()
    is_adventure = "adventure" in cluster.lower()

    acc_rates = {"budget": 10, "mid": 30, "luxury": 80}
    meal_rates_trek = {"budget": 18, "mid": 25, "luxury": 50}
    meal_rates_normal = {"budget": 12, "mid": 20, "luxury": 40}

    room_cost = acc_rates.get(accommodation_type, 30)
    meal_rate = meal_rates_trek.get(accommodation_type, 25) if (is_trek or is_remote) else meal_rates_normal.get(accommodation_type, 20)

    breakdown.append({
        "category": "Accommodation",
        "item": f"Teahouse/hotel ({accommodation_type}) x {duration} nights",
        "cost_usd": round(room_cost * duration, 2),
        "cost_npr": round(room_cost * duration * 135, 2),
        "notes": f"Rs {room_cost * 135}/night {accommodation_type} range."
    })

    breakdown.append({
        "category": "Meals",
        "item": f"3 meals daily x {duration} days",
        "cost_usd": round(meal_rate * duration, 2),
        "cost_npr": round(meal_rate * duration * 135, 2),
        "notes": "Dal bhat, momos, noodles. Tea/bottled water extra (Rs 270-675/day)."
    })

    permits = dest.get("permits", [])
    permit_total = 0
    for p in permits:
        range_match = re.search(r'\$(\d+(?:,\d+)?)\s*-\s*\$?(\d+(?:,\d+)?)', p)
        if range_match:
            low = float(range_match.group(1).replace(",", ""))
            high = float(range_match.group(2).replace(",", ""))
            permit_total += (low + high) / 2
            continue
        usd_match = re.search(r'\$(\d+(?:,\d+)?(?:\.\d+)?)', p)
        if usd_match:
            permit_total += float(usd_match.group(1).replace(",", ""))
            continue
        npr_match = re.search(r'NPR\s*([\d,]+)', p)
        if npr_match:
            permit_total += int(npr_match.group(1).replace(",", "")) / 135

    if is_remote and "Restricted" in str(permits):
        permit_total += 500

    if permit_total > 0:
        permit_names = [p.split(" (")[0] for p in permits] if permits else ["Restricted Area Permit"]
        breakdown.append({
            "category": "Permits",
            "item": " & ".join(permit_names),
            "cost_usd": round(permit_total, 2),
            "cost_npr": round(permit_total * 135, 2),
            "notes": "Obtain through registered agency in Kathmandu/Pokhara. Allow 1 day."
        })

    transport_cost = 0
    if "everest" in name:
        transport_cost = 340
        breakdown.append({
            "category": "Transport",
            "item": "Flight Kathmandu <-> Lukla (round trip)",
            "cost_usd": 340,
            "cost_npr": 340 * 135,
            "notes": "Book morning flights. Max 15kg baggage. Weather delays possible."
        })
    elif "annapurna" in name and "base" not in name:
        transport_cost = 180
        breakdown.append({
            "category": "Transport",
            "item": "Bus/Jeep KTM <-> Besishahar + Flight Jomsom -> Pokhara",
            "cost_usd": 180,
            "cost_npr": 180 * 135,
            "notes": "Combination of road transport and one-way flight."
        })
    elif is_remote or is_trek:
        transport_cost = 80
        breakdown.append({
            "category": "Transport",
            "item": "Bus/Jeep to trailhead (round trip)",
            "cost_usd": 80,
            "cost_npr": 80 * 135,
            "notes": "Local tourist bus or private jeep. 5-8 hours from Kathmandu."
        })
    elif is_wildlife:
        transport_cost = 60
        breakdown.append({
            "category": "Transport",
            "item": "Bus/Private vehicle to park (round trip)",
            "cost_usd": 60,
            "cost_npr": 60 * 135,
            "notes": "Tourist bus or private car. ~5 hrs from Kathmandu."
        })
    else:
        transport_cost = 40
        breakdown.append({
            "category": "Transport",
            "item": "Local transport & taxis",
            "cost_usd": 60,
            "cost_npr": 60 * 135,
            "notes": "Estimated local transport for the trip."
        })

    if guide_porter_required or dest.get("requires_guide"):
        guide = 25 * duration
        breakdown.append({
            "category": "Guide",
            "item": f"Licensed guide ({duration} days)",
            "cost_usd": guide,
            "cost_npr": guide * 135,
            "notes": "Rs 3,375/day. Mandatory for restricted areas. Also arrange permits."
        })
        porter = 20 * duration
        breakdown.append({
            "category": "Porter",
            "item": f"Porter (max 30kg, {duration} days)",
            "cost_usd": porter,
            "cost_npr": porter * 135,
            "notes": "Rs 2,700/day + tip. Porter welfare: max 30kg load, proper gear, insurance."
        })

    if accommodation_type == "budget" and (is_trek or is_remote):
        breakdown.append({
            "category": "Equipment",
            "item": "Gear rental (sleeping bag, down jacket, poles)",
            "cost_usd": 60,
            "cost_npr": 60 * 135,
            "notes": "Rent in Kathmandu/Pokhara. Check quality before renting."
        })

    subtotal = sum(item["cost_usd"] for item in breakdown)
    subtotal_npr = sum(item["cost_npr"] for item in breakdown)
    emergency_buffer = round(subtotal * 0.15, 2)
    emergency_buffer_npr = round(subtotal_npr * 0.15, 2)

    warnings = []
    if subtotal > 5000:
        warnings.append(f"High total cost (Rs {subtotal * 135:.0f}). Consider shorter duration or budget accommodation.")

    if dest.get("requires_guide") and not guide_porter_required:
        warnings.append("This destination requires a licensed guide. Enable 'Include guide' for accurate pricing.")

    return {
        "destination_name": dest["name"],
        "breakdown": breakdown,
        "subtotal": round(subtotal, 2),
        "subtotal_npr": round(subtotal_npr, 2),
        "emergency_buffer_15": emergency_buffer,
        "emergency_buffer_15_npr": emergency_buffer_npr,
        "grand_total": round(subtotal + emergency_buffer, 2),
        "grand_total_npr": round(subtotal_npr + emergency_buffer_npr, 2),
        "warnings": warnings,
    }
