from typing import Dict, Any


class DifficultyClassifier:
    def classify(self, dest: Dict[str, Any]) -> Dict[str, Any]:
        max_alt = dest.get("altitude_max", 1000)
        terrain = dest.get("terrain", "hill").lower()
        ascent_rate = dest.get("ascent_rate_per_day", 400)
        trail_exposure = dest.get("trail_exposure", "normal")
        season = dest.get("season", "autumn")

        if max_alt <= 2500 and terrain in ("terai", "urban", "city"):
            difficulty = "Easy"
        elif max_alt <= 2500 and terrain in ("hill", "forest"):
            difficulty = "Easy"
        elif max_alt <= 4000 and ascent_rate <= 400:
            difficulty = "Moderate"
        elif max_alt <= 4000 and ascent_rate > 400:
            difficulty = "Difficult"
        elif max_alt <= 5000 and trail_exposure in ("glacial", "ice") and season not in ("spring", "autumn"):
            difficulty = "Expert"
        elif max_alt <= 5000:
            difficulty = "Difficult"
        elif max_alt > 5000:
            difficulty = "Expert"
        else:
            difficulty = "Moderate"

        justification = self._generate_justification(difficulty, max_alt, terrain, ascent_rate)
        return {"difficulty": difficulty, "justification": justification}

    def _generate_justification(self, diff: str, alt: int, terrain: str, ascent: int) -> str:
        reasons = []
        reasons.append(f"Maximum altitude of {alt}m")

        if alt <= 2500:
            reasons.append("below the 2,500m threshold for moderate difficulty")
        elif alt <= 4000:
            reasons.append("within the 2,500–4,000m moderate difficulty band")
        elif alt <= 5000:
            reasons.append("in the 4,000–5,000m high-altitude band")
        else:
            reasons.append("above 5,000m — expert level by international standards")

        if terrain in ("glacial", "ice"):
            reasons.append("glacial terrain adds technical challenge")

        if ascent > 400:
            reasons.append(f"ascent rate of {ascent}m/day exceeds the 400m moderate threshold")

        return ". ".join(reasons) + "."
