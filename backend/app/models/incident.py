import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base


def generate_uuid():
    return str(uuid.uuid4())


def generate_incident_id():
    """Generate human-readable incident ID like INC-101."""
    return f"INC-{uuid.uuid4().hex[:6].upper()}"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, default=generate_incident_id)
    service = Column(String, nullable=False, index=True)
    environment = Column(String, nullable=False, default="Production")
    error_code = Column(String, nullable=True, index=True)
    error_message = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    deployment_version = Column(String, nullable=True)
    status = Column(String, nullable=False, default="open")  # open, investigating, resolved
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    resolutions = relationship("IncidentResolution", back_populates="incident", cascade="all, delete-orphan")
    investigations = relationship("InvestigationRun", back_populates="incident", cascade="all, delete-orphan")


class IncidentResolution(Base):
    __tablename__ = "incident_resolutions"

    id = Column(String, primary_key=True, default=generate_uuid)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False)
    root_cause = Column(Text, nullable=False)
    resolution = Column(Text, nullable=False)
    outcome = Column(String, nullable=False, default="resolved")  # resolved, mitigated, unresolved
    time_to_resolution = Column(Integer, nullable=True)  # in minutes
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    incident = relationship("Incident", back_populates="resolutions")


class InvestigationRun(Base):
    __tablename__ = "investigation_runs"

    id = Column(String, primary_key=True, default=generate_uuid)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False)
    memory_count = Column(Integer, default=0)
    model_provider = Column(String, nullable=False)
    investigation_output = Column(Text, nullable=False)  # JSON formatted text
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    incident = relationship("Incident", back_populates="investigations")
