import json
import os

DESTINATIONS_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "destinations.json")


def load_destinations():
    path = os.path.join(os.path.dirname(__file__), "..", "data", "destinations.json")
    with open(path, "r") as f:
        return json.load(f)


def get_all_destinations():
    return load_destinations()


def get_destination_by_name(name: str):
    dests = load_destinations()
    for d in dests:
        if d["name"].lower() == name.lower():
            return d
    return None


def get_destinations_by_cluster(cluster: str):
    dests = load_destinations()
    return [d for d in dests if d.get("cluster", "").lower() == cluster.lower()]
