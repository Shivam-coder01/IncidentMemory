import sys
from pathlib import Path
from fastapi.testclient import TestClient

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.main import app
from app.services.hindsight.memory_service import HindsightMemoryService
from app.services.llm.groq_provider import GroqProvider

client = TestClient(app)


def test_hindsight_offline_degradation():
    """
    Test Phase 9 requirement:
    When Hindsight server is unreachable, the system must NOT crash.
    It should log a warning, return fallback memories or empty list, and continue investigation.
    """
    # Instantiate Hindsight service pointing to invalid port
    service = HindsightMemoryService(api_url="http://localhost:99999")
    
    # Verify health check returns False without raising exception
    assert service.is_available() is False

    # Verify recall returns local fallback instead of crashing
    memories = service.recall_incidents(query="Payment API timeout")
    assert isinstance(memories, list)

    # Verify retain falls back gracefully
    retain_res = service.retain_incident(
        incident_id="TEST-001",
        service="Test Service",
        environment="Staging",
        error_code="ERR-500",
        error_message="Test error",
        description="Test description",
        root_cause="Test cause",
        resolution="Test fix",
    )
    assert retain_res["status"] == "success"
    assert retain_res["source"] == "local_fallback"


def test_llm_fallback_when_api_key_missing():
    """
    Test Phase 9 requirement:
    When LLM API key is unconfigured or invalid, provider must use fallback engine.
    """
    provider = GroqProvider(api_key="your_api_key_here")
    
    incident = {
        "service": "Payment API",
        "environment": "Production",
        "error_code": "DB-504",
        "error_message": "Database connection pool timeout",
        "description": "Checkout failing",
    }
    memories = "--- HISTORICAL MEMORY #1 ---\nIncident ID: INC-017\nService: Payment API\nRoot Cause: Pool exhaustion"

    result = provider.generate_investigation(incident, memories)
    
    assert result is not None
    assert "incident_summary" in result
    assert "possible_root_causes" in result
    assert "recommended_investigation_steps" in result


def test_novel_incident_without_memories():
    """
    Test Phase 9 requirement:
    Agent investigation when NO past historical memories match.
    """
    provider = GroqProvider()
    
    incident = {
        "service": "New Unseen Microservice",
        "environment": "Production",
        "error_code": "NOVEL-999",
        "error_message": "Unprecedented internal state error",
        "description": "First time occurrence of this error",
    }
    empty_memories = "No historical incident memories found matching this situation."

    result = provider.generate_investigation(incident, empty_memories)
    
    assert result is not None
    assert result["confidence_level"].startswith("Low") or "No historical" in result["confidence_level"]
    assert len(result["recommended_investigation_steps"]) > 0


def test_recurring_incident_detection():
    """
    Test Phase 9 requirement:
    When 2+ past incidents match, agent must flag recurring_pattern_detected = True.
    """
    provider = GroqProvider()
    
    incident = {
        "service": "Payment API",
        "environment": "Production",
        "error_code": "DB-504",
        "error_message": "Database connection timeout limit exceeded",
        "description": "Payment checkout failing again",
    }
    multiple_memories = (
        "--- HISTORICAL MEMORY #1 ---\nIncident ID: INC-017\nService: Payment API\nError Code: DB-504\n\n"
        "--- HISTORICAL MEMORY #2 ---\nIncident ID: INC-023\nService: Payment API\nError Code: DB-504\n"
    )

    result = provider.generate_investigation(incident, multiple_memories)
    
    assert result is not None
    assert result["recurring_pattern_detected"] is True


def test_api_invalid_payload_validation():
    """
    Test Phase 9 requirement:
    Sending incomplete/invalid JSON payload returns HTTP 422 Unprocessable Entity cleanly.
    """
    invalid_payload = {
        "service": "Payment API"
        # missing required error_message and description
    }
    
    res = client.post("/api/investigate", json=invalid_payload)
    assert res.status_code == 422
