import numpy as np
from sklearn.cluster import KMeans
from typing import List, Dict, Any


class DestinationClusterer:
    def __init__(self, n_clusters: int = 5):
        self.n_clusters = n_clusters
        self.kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        self.cluster_labels = None
        self.feature_names = [
            "altitude_normalized",
            "cost_normalized",
            "terrain_trekk", "terrain_city", "terrain_jungle",
            "activity_trekking", "activity_cultural", "activity_wildlife",
            "activity_adventure", "difficulty_score"
        ]

    def _extract_features(self, destinations: List[Dict[str, Any]]) -> np.ndarray:
        features = []
        for d in destinations:
            alt = d.get("altitude_max", 1000)
            cost = d.get("cost_per_day_usd", 50)
            terrain = d.get("terrain", "hill")
            activities = d.get("activities", [])
            diff = d.get("difficulty", "moderate")

            difficulty_map = {"easy": 1, "moderate": 2, "difficult": 3, "expert": 4}
            diff_score = difficulty_map.get(diff.lower(), 2)

            t = terrain.lower()
            feat = [
                alt / 5500.0,
                cost / 150.0,
                1 if any(kw in t for kw in ["trek", "himalayan", "alpine", "glacial", "mountain", "rocky"]) else 0,
                1 if t in ("city", "urban") else 0,
                1 if t in ("jungle", "terai", "forest") else 0,
                1 if "trekking" in activities else 0,
                1 if any(a in ["cultural", "temple", "heritage"] for a in activities) else 0,
                1 if "wildlife" in activities else 0,
                1 if any(a in ["paragliding", "rafting", "bungee"] for a in activities) else 0,
                diff_score / 4.0,
            ]
            features.append(feat)
        return np.array(features)

    def fit_predict(self, destinations: List[Dict[str, Any]]) -> List[int]:
        X = self._extract_features(destinations)
        self.cluster_labels = self.kmeans.fit_predict(X)
        return self.cluster_labels.tolist()

    def get_cluster_info(self, label: int) -> Dict[str, Any]:
        cluster_names = {
            0: "High Himalayan Trek",
            1: "Cultural Heritage",
            2: "Wildlife & Terai",
            3: "Adventure Hub",
            4: "Remote Wilderness",
        }
        return {
            "cluster_id": int(label),
            "cluster_name": cluster_names.get(label, f"Cluster {label}"),
        }
