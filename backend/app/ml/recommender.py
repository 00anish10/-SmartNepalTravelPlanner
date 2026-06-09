import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any, Optional
import hashlib
import json


class ContentBasedRecommender:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=500,
            stop_words=['the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are']
        )
        self.destination_vectors = None
        self.destination_names = []
        self.destination_data = []
        self._fitted = False
        self._feature_texts = None

    def _get_cache_key(self, destinations: List[Dict]) -> str:
        names = json.dumps([d["name"] for d in destinations], sort_keys=True)
        return hashlib.md5(names.encode()).hexdigest()

    def build_feature_text(self, dest: Dict[str, Any]) -> str:
        features = []
        cluster_keywords = {
            "High Himalayan Treks": "trekking mountain climbing hiking altitude adventure challenging extreme",
            "Cultural Heritage": "temple culture history religion spiritual architecture museum heritage",
            "Wildlife and Terai": "wildlife jungle safari bird watching nature forest ecosystem",
            "Adventure and Mid-Hill": "paragliding rafting kayaking adventure scenic hill sunrise moderate",
            "Remote Wilderness": "remote offbeat pristine wilderness isolated trekking camping"
        }

        features.append(cluster_keywords.get(dest.get("cluster", ""), ""))
        features.append(dest.get("terrain", ""))
        features.append(dest.get("region", ""))

        desc = dest.get("description", "")
        if desc:
            keywords = [w for w in desc.lower().split() if len(w) > 3][:30]
            features.append(" ".join(keywords))

        activities = dest.get("activities", [])
        if isinstance(activities, list):
            features.append(" ".join(activities))

        difficulty = dest.get("difficulty", "")
        features.append(f"difficulty_{difficulty}")

        seasons = dest.get("best_seasons", [])
        if isinstance(seasons, list):
            features.append(" ".join(seasons))

        highlights = dest.get("highlights", [])
        if isinstance(highlights, list):
            features.append(" ".join(highlights[:5]))

        return " ".join(features).lower()

    def build_user_feature_text(self, preferences: Dict[str, Any]) -> str:
        features = []
        interests = preferences.get("interests", [])
        features.append(" ".join(interests))
        features.append(preferences.get("season", ""))
        features.append(preferences.get("fitness_level", ""))
        features.append(preferences.get("travel_type", ""))
        return " ".join(features).lower()

    def fit(self, destinations: List[Dict[str, Any]]):
        self.destination_data = destinations
        self.destination_names = [d["name"] for d in destinations]
        self._feature_texts = [self.build_feature_text(d) for d in destinations]
        self.destination_vectors = self.vectorizer.fit_transform(self._feature_texts)
        self._fitted = True

    def recommend(
        self,
        user_preferences: Dict[str, Any],
        destinations: List[Dict[str, Any]],
        top_n: int = 5
    ) -> List[Dict[str, Any]]:
        needs_refit = (
            not self._fitted
            or len(self.destination_data) != len(destinations)
            or any(
                self.destination_data[i]["name"] != d["name"]
                for i, d in enumerate(destinations)
            )
        )
        if needs_refit:
            self.fit(destinations)

        user_text = self.build_user_feature_text(user_preferences)
        user_vector = self.vectorizer.transform([user_text])
        similarities = cosine_similarity(user_vector, self.destination_vectors).flatten()

        scored = []
        for i, dest in enumerate(destinations):
            score = float(similarities[i])

            duration = user_preferences.get("duration", 7)
            dest_min = dest.get("duration_min", 1)
            dest_max = dest.get("duration_max", 30)
            if dest_min <= duration <= dest_max:
                score *= 1.2
            else:
                score *= 0.7

            budget = user_preferences.get("budget", 500)
            cost_per_day = dest.get("cost_per_day_usd", 50)
            total_est = cost_per_day * duration
            if total_est <= budget:
                score *= 1.3
            elif total_est <= budget * 1.5:
                score *= 1.0
            else:
                score *= 0.5

            fitness = user_preferences.get("fitness_level", "moderate")
            dest_fitness = dest.get("fitness_level", "moderate")
            fitness_map = {"sedentary": 0, "moderate": 1, "active": 2, "athletic": 3}
            user_f = fitness_map.get(fitness, 1)
            dest_f = fitness_map.get(dest_fitness, 1)
            if user_f >= dest_f:
                score *= 1.2
            elif user_f + 1 >= dest_f:
                score *= 0.8
            else:
                score *= 0.4

            user_season = user_preferences.get("season", "autumn")
            best_seasons = dest.get("best_seasons", [])
            if isinstance(best_seasons, list) and user_season in best_seasons:
                score *= 1.25
            elif isinstance(best_seasons, list) and best_seasons:
                score *= 0.8

            user_interests = set(user_preferences.get("interests", []))
            dest_activities = set(dest.get("activities", []))
            overlap = len(user_interests & dest_activities)
            if overlap > 0:
                score *= (1 + 0.12 * overlap)

            scored.append((score, i))

        scored.sort(key=lambda x: x[0], reverse=True)
        results = []
        for score, idx in scored[:top_n]:
            dest = dict(destinations[idx])
            dest["match_score"] = round(min(score * 100, 99.9), 1)
            dest["similarity_explanation"] = self._generate_explanation(dest, user_preferences, score)
            results.append(dest)

        return results

    def _generate_explanation(self, dest: Dict, prefs: Dict, score: float) -> str:
        parts = []
        user_interests = prefs.get("interests", [])
        dest_activities = dest.get("activities", [])

        matching = [a for a in dest_activities if a in user_interests]
        if matching:
            parts.append(f"Matches your interest in {', '.join(matching)}")

        dur = prefs.get("duration", 7)
        if dest.get("duration_min", 0) <= dur <= dest.get("duration_max", 99):
            parts.append(f"Fits your {dur}-day schedule")
        else:
            parts.append(f"Consider adjusting duration ({dest.get('duration_min', '?')}-{dest.get('duration_max', '?')} days typical)")

        fitness = prefs.get("fitness_level", "")
        dest_f = dest.get("fitness_level", "")
        if fitness == dest_f:
            parts.append(f"Perfect for {fitness} fitness level")
        elif fitness in ("active", "athletic") and dest_f in ("moderate", "difficult"):
            parts.append("Challenging but achievable at your fitness level")
        elif dest_f == "expert":
            parts.append("Requires expert-level fitness — prepare thoroughly")

        season = prefs.get("season", "")
        best = dest.get("best_seasons", [])
        if season in best:
            parts.append(f"Optimal in {season} season")
        elif best:
            parts.append(f"Best visited in {'/'.join(best)}")

        cost = dest.get("cost_per_day_usd", 50) * dur
        budget = prefs.get("budget", 1000)
        if cost <= budget:
            parts.append(f"Within your Rs {budget * 135:.0f} budget (est. Rs {cost * 135:.0f})")
        elif cost <= budget * 1.2:
            parts.append(f"Slightly above Rs {budget * 135:.0f} budget at ~Rs {cost * 135:.0f}")
        else:
            parts.append(f"Estimated cost ~Rs {cost * 135:.0f} — review budget section")

        return ". ".join(parts) + "."
