from fastapi import APIRouter, HTTPException
from app.services.destination_service import get_destination_by_name
from app.ml.difficulty import DifficultyClassifier

router = APIRouter()
classifier = DifficultyClassifier()


@router.get("/report/{destination_name}", response_model=dict)
def safety_report(destination_name: str):
    dest = get_destination_by_name(destination_name)
    if not dest:
        raise HTTPException(status_code=404, detail=f"Destination '{destination_name}' not found")

    diff_result = classifier.classify(dest)
    max_alt = dest.get("altitude_max", 1000)
    name = dest["name"].lower()

    ams_level = "Low"
    if max_alt > 5000:
        ams_level = "Very High"
    elif max_alt > 4000:
        ams_level = "High"
    elif max_alt > 3000:
        ams_level = "Moderate"

    acclimatization_days = 0
    if max_alt > 3000:
        acclimatization_days = (max_alt - 3000) // 1000

    acclimatization_schedule = []
    if acclimatization_days > 0:
        acclimatization_schedule.append("Days 1-2: Arrive in Kathmandu/Pokhara (1,400m) — rest and hydrate")
    if max_alt > 3000:
        acclimatization_schedule.append(f"At ~3,000m: First acclimatization rest day — hike high, sleep low")
    if max_alt > 4000:
        acclimatization_schedule.append(f"At ~4,000m: Second acclimatization day — mandatory (AMS risk increases)")
    if max_alt > 5000:
        acclimatization_schedule.append(f"Above 5,000m: Maximum 300m/day gain. Diamox recommended (consult doctor first)")

    fitness_map = {
        "easy": "2-4 weeks of regular cardio (jogging, cycling, swimming)",
        "moderate": "4-6 weeks including stair climbing with a loaded backpack (10kg)",
        "difficult": "8-12 weeks of strength training + endurance cardio + stair climbs with 15kg",
        "expert": "12-16 weeks intensive training. Previous high-altitude experience recommended. Technical skills required.",
    }

    return {
        "destination_name": dest["name"],
        "difficulty": diff_result["difficulty"],
        "difficulty_explanation": diff_result["justification"],
        "max_altitude": max_alt,
        "ams_risk_level": ams_level,
        "required_acclimatization_days": acclimatization_days,
        "acclimatization_schedule": acclimatization_schedule,
        "recommended_fitness_prep": fitness_map.get(dest.get("difficulty", "moderate").lower(), fitness_map["moderate"]),
        "essential_gear": get_essential_gear(dest),
        "emergency_evacuation_points": get_evacuation_points(name),
        "nearest_hospital": get_nearest_hospital(name),
        "safety_flags": get_safety_flags(dest),
        "permits_required": dest.get("permits", []),
    }


def get_essential_gear(dest: dict) -> list:
    base = [
        "Trekking boots (waterproof, broken-in)",
        "Backpack (40-60L)",
        "Water bottle/hydration bladder (3L minimum)",
        "Sunscreen SPF 50+",
        "Lip balm SPF 30+",
        "First aid kit (blister care, painkillers, antiseptic)",
        "Headlamp/torch with extra batteries",
    ]
    diff = dest.get("difficulty", "").lower()
    alt = dest.get("altitude_max", 1000)
    terrain = dest.get("terrain", "").lower()

    if diff in ("difficult", "expert") or alt > 4000:
        base.extend([
            "Down jacket (rated to -20°C)",
            "Sleeping bag (rated to -15°C)",
            "Trekking poles (adjustable)",
            "Microspikes / light crampons",
            "Diamox (consult doctor before use)",
            "Satellite phone or Garmin inReach",
            "Nalgene bottle (metal — won't freeze)",
        ])
    if alt > 5000:
        base.extend([
            "Oxygen saturation monitor (pulse oximeter)",
            "Portable oxygen canisters (optional but recommended)",
        ])
    if "glacial" in terrain:
        base.extend([
            "Ice axe (technical)",
            "Mountaineering boots (insulated, crampon-compatible)",
            "Harness and locking carabiners",
            "Crampons (step-in or strap-on)",
        ])
    elif diff in ("expert",) or alt > 5000:
        base.append("Ice axe and crampons (for high passes)")
    if "jungle" in terrain or "wetland" in terrain:
        base.extend([
            "Insect repellent (DEET 50% minimum)",
            "Lightweight long sleeves and pants",
            "Waterproof breathable jacket",
            "Anti-malarial medication (consult doctor)",
        ])

    return base


def get_evacuation_points(name: str) -> list:
    if "everest" in name:
        return [
            "Lukla Hospital (basic care)",
            "Kunde Hospital (Himalayan Rescue Association)",
            "Pheriche Medical Clinic (AMS treatment)",
            "Helicopter evacuation: Rs 5.4L-6.75L (covered by insurance)",
        ]
    if "annapurna" in name:
        return [
            "Pokhara Hospital (regional referral)",
            "Manang Medical Center (altitude clinic)",
            "Jomsom Health Post",
            "Helicopter evacuation: Rs 4.05L-5.4L",
        ]
    if "langtang" in name:
        return [
            "Dhunche Health Post",
            "Kathmandu Teaching Hospital (helicopter transfer)",
            "Helicopter evacuation: Rs 4.05L-5.4L",
        ]
    if "manaslu" in name or "tsum" in name:
        return [
            "Samagaon Health Post",
            "Gorkha District Hospital (road access)",
            "Helicopter evacuation: Rs 5.4L-6.75L",
        ]
    if "mustang" in name or "dolpo" in name or "humla" in name or "nar phu" in name:
        return [
            "Jomsom Health Post (Mustang)",
            "Nepalgunj or Pokhara for serious cases",
            "Helicopter evacuation: Rs 6.75L-9.45L (remote area surcharge)",
        ]
    if "chitwan" in name:
        return ["Bharatpur Hospital (major hospital, 20 min)", "Helicopter evacuation: Rs 2.03L-2.7L"]
    if "bardia" in name:
        return ["Nepalgunj Medical College (1 hr drive)", "Helicopter evacuation: Rs 2.7L-4.05L"]
    if "pokhara" in name or "poon" in name or "gandruk" in name:
        return ["Pokhara Hospital (15 min)", "Helicopter evacuation: Rs 2.7L-4.05L"]

    return [
        "Nearest district health post",
        "Kathmandu or Pokhara for serious cases (air evacuation)",
        "Helicopter evacuation arranged through local agencies: Rs 4.05L-6.75L",
    ]


def get_nearest_hospital(name: str) -> str:
    if "everest" in name:
        return "Kunde Hospital (Khunde, near Namche Bazaar) — Himalayan Rescue Association altitude clinic"
    if "annapurna" in name:
        return "Manang Medical Center (on-route) or Pokhara Hospital (for evacuation)"
    if "langtang" in name:
        return "Dhunche Health Post or Kathmandu Teaching Hospital (helicopter evacuation)"
    if "manaslu" in name:
        return "Samagaon Health Post or Gorkha Hospital"
    if "mustang" in name:
        return "Jomsom Health Post or Pokhara Hospital"
    if "dolpo" in name or "humla" in name:
        return "Nepalgunj Medical College or Pokhara Hospital (air evacuation required)"
    if "chitwan" in name:
        return "Bharatpur Hospital — 20 min drive, well-equipped"
    if "bardia" in name:
        return "Nepalgunj Medical College — 1 hour drive"
    if "pokhara" in name:
        return "Pokhara Hospital (Fewa) — 15 min from lakeside"
    return "Biratnagar Teaching Hospital / Kathmandu Medical College — air evacuation if critical"


def get_safety_flags(dest: dict) -> list:
    flags = []
    alt = dest.get("altitude_max", 1000)

    if alt > 4000:
        flags.append("HIGH ALTITUDE: Risk of AMS, HAPE, HACE. Follow acclimatization protocol strictly. Know STOP & DESCEND signs.")
    elif alt > 3000:
        flags.append("MODERATE ALTITUDE: AMS possible above 3,000m. Ascend slowly (max 400m/day above 3,000m).")

    if dest.get("requires_guide"):
        flags.append("LICENSED GUIDE REQUIRED: Restricted area. Must enter with registered guide in organized group (minimum 2 trekkers).")

    terrain = dest.get("terrain", "").lower()
    if "glacial" in terrain:
        flags.append("GLACIAL TERRAIN: Crevasses and icefall risk. Technical equipment and training required.")
    if "jungle" in terrain or "terai" in terrain:
        flags.append("TROPICAL CONDITIONS: High heat and humidity outside Oct-Mar. Mosquito-borne illness risk. Use DEET repellent.")

    if dest.get("best_seasons"):
        flags.append(f"BEST SEASON: {'/'.join(dest['best_seasons'])}. Book teahouses in advance for peak seasons.")

    flags.append("WEATHER: Mountain weather changes rapidly. Always check local forecast before departure.")
    flags.append("INSURANCE: Comprehensive travel insurance with helicopter evacuation coverage (minimum Rs 6.75Cr) is MANDATORY for all trekking.")
    flags.append("TREKKING HOURS: Average 5-7 hours walking per day. Start early (6-7 AM) to avoid afternoon weather.")

    return flags
