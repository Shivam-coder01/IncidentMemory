from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Query
from app.services.hindsight.memory_service import hindsight_service
from app.core.config import settings

router = APIRouter(prefix="/api/memories", tags=["Hindsight Memory"])


@router.get("/search")
def search_hindsight_memories(
    query: str = Query(..., description="Keyword or symptom search query"),
    service: Optional[str] = Query(None, description="Optional service name filter"),
    limit: int = Query(10, ge=1, le=50),
):
    """
    Search memories directly from Hindsight memory bank for the Hindsight Memory Explorer screen.
    """
    memories = hindsight_service.recall_incidents(
        query=query,
        service=service,
        limit=limit,
    )
    
    return {
        "bank_id": settings.HINDSIGHT_BANK_ID,
        "query": query,
        "service_filter": service,
        "count": len(memories),
        "results": memories,
        "hindsight_source": "Hindsight Memory Engine",
    }


@router.get("/reflect")
def reflect_on_memories(
    query: str = Query(..., description="Topic or query for organizational reflection"),
):
    """Reflect across stored incident memories to synthesize high-level organizational insights."""
    reflection = hindsight_service.reflect_on_incidents(query=query)
    return reflection
