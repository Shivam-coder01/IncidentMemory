from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.incident import InvestigationRequest, InvestigationResponse
from app.services.agent.investigator import agent_investigator

router = APIRouter(prefix="/api/investigate", tags=["Investigate"])


@router.post("", response_model=InvestigationResponse)
def run_investigation(
    payload: InvestigationRequest,
    db: Session = Depends(get_db),
):
    """
    Run AI Agent Investigation Loop:
    1. Parse incident telemetry.
    2. Search Hindsight memory bank for matching historical incidents.
    3. Inject retrieved memories into LLM context.
    4. Generate structured AI investigation report.
    5. Audit run in database.
    """
    try:
        result = agent_investigator.investigate_incident(
            incident_telemetry=payload.model_dump(),
            db=db,
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Agent investigation failed: {str(e)}"
        )
