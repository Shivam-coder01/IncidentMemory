from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.incident import Incident, IncidentResolution
from app.schemas.incident import (
    IncidentCreate,
    IncidentResponse,
    IncidentResolutionCreate,
    IncidentResolutionResponse,
)
from app.services.agent.investigator import agent_investigator

router = APIRouter(prefix="/api/incidents", tags=["Incidents"])


@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def create_incident(payload: IncidentCreate, db: Session = Depends(get_db)):
    """Create a new production incident ticket."""
    incident = Incident(
        service=payload.service,
        environment=payload.environment,
        error_code=payload.error_code,
        error_message=payload.error_message,
        description=payload.description,
        deployment_version=payload.deployment_version,
        status="open",
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


@router.get("", response_model=List[IncidentResponse])
def list_incidents(
    status_filter: Optional[str] = None,
    service_filter: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List all incident tickets with optional status and service filters."""
    query = db.query(Incident)
    if status_filter:
        query = query.filter(Incident.status == status_filter)
    if service_filter:
        query = query.filter(Incident.service == service_filter)
    
    return query.order_by(Incident.created_at.desc()).all()


@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    """Get single incident details by ID."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident '{incident_id}' not found")
    return incident


@router.post("/{incident_id}/resolve", response_model=IncidentResolutionResponse)
def resolve_incident(
    incident_id: str,
    payload: IncidentResolutionCreate,
    db: Session = Depends(get_db),
):
    """Resolve an incident and retain the solution knowledge into Hindsight."""
    try:
        resolution = agent_investigator.resolve_and_retain_incident(
            incident_id=incident_id,
            resolution_data=payload.model_dump(),
            db=db,
        )
        return resolution
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed resolving incident: {str(e)}")
