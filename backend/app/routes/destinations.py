from fastapi import APIRouter, HTTPException, Query
from app.services.destination_service import get_all_destinations, get_destination_by_name, get_destinations_by_cluster

router = APIRouter()


@router.get("/", response_model=list)
def list_destinations(cluster: str = Query(None)):
    if cluster:
        return get_destinations_by_cluster(cluster)
    return get_all_destinations()


@router.get("/{name}", response_model=dict)
def get_destination(name: str):
    dest = get_destination_by_name(name)
    if not dest:
        raise HTTPException(status_code=404, detail=f"Destination '{name}' not found")
    return dest
