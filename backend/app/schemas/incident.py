from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# Incident Schemas
class IncidentBase(BaseModel):
    service: str = Field(..., example="Payment API")
    environment: str = Field(default="Production", example="Production")
    error_code: Optional[str] = Field(default=None, example="DB-504")
    error_message: str = Field(..., example="Database connection pool timeout limit exceeded")
    description: str = Field(..., example="Payment checkout failing for 15% of users with DB timeout")
    deployment_version: Optional[str] = Field(default=None, example="v2.4.1")


class IncidentCreate(IncidentBase):
    pass


class IncidentResponse(IncidentBase):
    id: str
    status: str
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Investigation Schemas
class InvestigationRequest(BaseModel):
    incident_id: Optional[str] = None
    service: str
    environment: str = "Production"
    error_code: Optional[str] = None
    error_message: str
    description: str
    deployment_version: Optional[str] = None


class HistoricalMatch(BaseModel):
    incident_id: Optional[str] = None
    service: Optional[str] = None
    similarity_reason: Optional[str] = None
    historical_root_cause: Optional[str] = None
    historical_resolution: Optional[str] = None
    content: Optional[str] = None


class RootCauseHypothesis(BaseModel):
    cause: str
    likelihood: str
    explanation: str


class InvestigationResult(BaseModel):
    incident_summary: str
    recurring_pattern_detected: bool = False
    relevant_historical_incidents: List[HistoricalMatch] = []
    similarities: List[str] = []
    possible_root_causes: List[RootCauseHypothesis] = []
    historical_evidence: str
    recommended_investigation_steps: List[str] = []
    previously_successful_resolutions: List[str] = []
    confidence_level: str
    provider_info: Optional[str] = None


class InvestigationResponse(BaseModel):
    incident_id: str
    hindsight_available: bool
    memories_count: int
    recalled_memories: List[Dict[str, Any]]
    investigation: InvestigationResult
    execution_steps: List[Dict[str, str]]


# Resolution Schemas
class IncidentResolutionCreate(BaseModel):
    root_cause: str = Field(..., example="Connection pool exhaustion under high concurrency")
    resolution: str = Field(..., example="Increased pool size from 20 to 50 in pool_config.yaml")
    outcome: str = Field(default="resolved", example="resolved")
    time_to_resolution: Optional[int] = Field(default=None, example=18)


class IncidentResolutionResponse(BaseModel):
    id: str
    incident_id: str
    root_cause: str
    resolution: str
    outcome: str
    time_to_resolution: Optional[int] = None
    hindsight_retained: bool
    created_at: datetime

    class Config:
        from_attributes = True
