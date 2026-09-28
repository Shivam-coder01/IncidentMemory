import json
import logging
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from app.models.incident import Incident, IncidentResolution, InvestigationRun
from app.services.hindsight.memory_service import hindsight_service
from app.services.llm.factory import LLMFactory
from app.core.config import settings

logger = logging.getLogger("incident_memory.agent")


class IncidentInvestigatorAgent:
    """Core AI agent orchestrator connecting telemetry, Hindsight memory recall/retain, and LLM reasoning."""

    def investigate_incident(
        self,
        incident_telemetry: Dict[str, Any],
        db: Session,
    ) -> Dict[str, Any]:
        execution_steps = []

        # Step 1: Analyze incident telemetry
        service = incident_telemetry.get("service", "Unknown")
        error_code = incident_telemetry.get("error_code") or ""
        error_msg = incident_telemetry.get("error_message", "")
        desc = incident_telemetry.get("description", "")
        
        execution_steps.append({
            "step": "Analyzing incident telemetry",
            "status": "completed",
            "detail": f"Parsed telemetry for service '{service}' (Error Code: {error_code or 'N/A'})"
        })

        # Step 2: Ensure Incident record exists in database
        incident_id = incident_telemetry.get("incident_id")
        db_incident = None
        if incident_id:
            db_incident = db.query(Incident).filter(Incident.id == incident_id).first()

        if not db_incident:
            db_incident = Incident(
                service=service,
                environment=incident_telemetry.get("environment", "Production"),
                error_code=error_code,
                error_message=error_msg,
                description=desc,
                deployment_version=incident_telemetry.get("deployment_version"),
                status="investigating",
            )
            db.add(db_incident)
            db.commit()
            db.refresh(db_incident)

        # Step 3: Query Hindsight memory bank
        query_text = f"{service} {error_code} {error_msg} {desc}"
        recalled_memories = hindsight_service.recall_incidents(
            query=query_text,
            service=service,
            limit=5
        )

        hindsight_available = True  # hindsight_service handles fallback gracefully
        mem_count = len(recalled_memories)

        execution_steps.append({
            "step": "Searching Hindsight persistent memory bank",
            "status": "completed",
            "detail": f"Recalled {mem_count} relevant historical incident memory documents"
        })

        # Step 4: Format memories for prompt context injection
        formatted_memories = hindsight_service.format_memories_for_prompt(recalled_memories)

        execution_steps.append({
            "step": "Contextual memory assembly",
            "status": "completed",
            "detail": "Injected recalled Hindsight memories into agent system context"
        })

        # Step 5: LLM Reasoning
        llm_provider = LLMFactory.get_provider()
        raw_investigation = llm_provider.generate_investigation(
            current_incident={
                "service": service,
                "environment": db_incident.environment,
                "error_code": error_code,
                "error_message": error_msg,
                "description": desc,
                "deployment_version": db_incident.deployment_version,
            },
            formatted_memories=formatted_memories,
        )

        execution_steps.append({
            "step": "Generating AI investigation report",
            "status": "completed",
            "detail": f"Completed diagnostic analysis using provider '{settings.LLM_PROVIDER}'"
        })

        # Step 6: Record investigation run audit in database
        investigation_run = InvestigationRun(
            incident_id=db_incident.id,
            memory_count=mem_count,
            model_provider=f"{settings.LLM_PROVIDER}/{settings.LLM_MODEL}",
            investigation_output=json.dumps(raw_investigation),
        )
        db.add(investigation_run)
        db.commit()

        return {
            "incident_id": db_incident.id,
            "hindsight_available": hindsight_available,
            "memories_count": mem_count,
            "recalled_memories": recalled_memories,
            "investigation": raw_investigation,
            "execution_steps": execution_steps,
        }

    def resolve_and_retain_incident(
        self,
        incident_id: str,
        resolution_data: Dict[str, Any],
        db: Session,
    ) -> Dict[str, Any]:
        """
        Mark incident as resolved in database and persist resolution knowledge into Hindsight.
        """
        db_incident = db.query(Incident).filter(Incident.id == incident_id).first()
        if not db_incident:
            raise ValueError(f"Incident with ID '{incident_id}' not found.")

        # Update incident status
        db_incident.status = "resolved"
        db_incident.resolved_at = datetime.utcnow()

        # Save resolution record
        resolution_record = IncidentResolution(
            incident_id=incident_id,
            root_cause=resolution_data["root_cause"],
            resolution=resolution_data["resolution"],
            outcome=resolution_data.get("outcome", "resolved"),
            time_to_resolution=resolution_data.get("time_to_resolution"),
        )
        db.add(resolution_record)
        db.commit()
        db.refresh(resolution_record)

        # Retain into Hindsight persistent memory
        retain_result = hindsight_service.retain_incident(
            incident_id=db_incident.id,
            service=db_incident.service,
            environment=db_incident.environment,
            error_code=db_incident.error_code or "N/A",
            error_message=db_incident.error_message,
            description=db_incident.description,
            root_cause=resolution_record.root_cause,
            resolution=resolution_record.resolution,
            outcome=resolution_record.outcome,
            time_to_resolution=resolution_record.time_to_resolution,
            deployment_version=db_incident.deployment_version,
        )

        return {
            "id": resolution_record.id,
            "incident_id": db_incident.id,
            "root_cause": resolution_record.root_cause,
            "resolution": resolution_record.resolution,
            "outcome": resolution_record.outcome,
            "time_to_resolution": resolution_record.time_to_resolution,
            "hindsight_retained": retain_result["status"] == "success",
            "created_at": resolution_record.created_at,
        }


agent_investigator = IncidentInvestigatorAgent()
