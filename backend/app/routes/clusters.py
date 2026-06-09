from fastapi import APIRouter, HTTPException
from app.services.destination_service import get_all_destinations
from app.ml.clusterer import DestinationClusterer

router = APIRouter()
clusterer = DestinationClusterer()


@router.get("/", response_model=dict)
def get_cluster_analysis():
    dests = get_all_destinations()
    if not dests:
        raise HTTPException(status_code=404, detail="No destinations found")

    labels = clusterer.fit_predict(dests)

    clusters = {}
    for i, dest in enumerate(dests):
        label = labels[i]
        label_name = clusterer.get_cluster_info(label)["cluster_name"]
        if label not in clusters:
            clusters[label] = {
                "cluster_id": int(label),
                "cluster_name": label_name,
                "count": 0,
                "destinations": [],
                "avg_altitude": 0,
                "avg_cost": 0,
            }
        clusters[label]["count"] += 1
        clusters[label]["destinations"].append(dest["name"])
        clusters[label]["avg_altitude"] += dest.get("altitude_max", 0)
        clusters[label]["avg_cost"] += dest.get("cost_per_day_usd", 0)

    for label, data in clusters.items():
        data["avg_altitude"] = round(data["avg_altitude"] / data["count"])
        data["avg_cost"] = round(data["avg_cost"] / data["count"], 1)

    return {
        "total_destinations": len(dests),
        "n_clusters": clusterer.n_clusters,
        "feature_names": clusterer.feature_names,
        "clusters": sorted(clusters.values(), key=lambda x: x["cluster_id"]),
    }


@router.get("/{destination_name}", response_model=dict)
def get_destination_cluster(destination_name: str):
    dests = get_all_destinations()
    labels = clusterer.fit_predict(dests)

    for i, d in enumerate(dests):
        if d["name"].lower() == destination_name.lower():
            info = clusterer.get_cluster_info(labels[i])
            return {
                "destination": d["name"],
                "cluster": info,
                "all_clusters": sorted([
                    clusterer.get_cluster_info(l) for l in set(labels)
                ], key=lambda x: x["cluster_id"]),
            }

    raise HTTPException(status_code=404, detail=f"Destination '{destination_name}' not found")
