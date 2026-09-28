import sys
from pathlib import Path
from fastapi.testclient import TestClient

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.main import app

client = TestClient(app)


def test_complete_agent_loop():
    """
    Test Phase 4 requirement:
    Full Agent Loop:
    1. Receive/create incident
    2. Investigate (Recall Hindsight + LLM reasoning)
    3. Return structured investigation result
    4. Resolve incident
    5. Retain resolution in Hindsight
    6. Search Hindsight memory bank to verify newly retained knowledge
    """
    # 1. Create incident ticket
    incident_payload = {
        "service": "Payment API",
        "environment": "Production",
        "error_code": "DB-504",
        "error_message": "Database connection pool limit exceeded (10000ms)",
        "description": "Payment checkout failing for 15% of active users",
        "deployment_version": "v2.4.1"
    }

    create_res = client.post("/api/incidents", json=incident_payload)
    assert create_res.status_code == 201
    incident_data = create_res.json()
    incident_id = incident_data["id"]
    assert incident_id is not None
    assert incident_data["status"] == "open"

    # 2. Run investigation
    investigation_payload = {
        "incident_id": incident_id,
        "service": incident_payload["service"],
        "environment": incident_payload["environment"],
        "error_code": incident_payload["error_code"],
        "error_message": incident_payload["error_message"],
        "description": incident_payload["description"],
        "deployment_version": incident_payload["deployment_version"]
    }

    inv_res = client.post("/api/investigate", json=investigation_payload)
    assert inv_res.status_code == 200
    inv_data = inv_res.json()

    assert inv_data["incident_id"] == incident_id
    assert "investigation" in inv_data
    assert "execution_steps" in inv_data
    assert len(inv_data["execution_steps"]) > 0

    # 3. Resolve incident and retain in Hindsight
    resolution_payload = {
        "root_cause": "Connection pool exhaustion under high concurrency",
        "resolution": "Increased pool size from 20 to 50 in pool_config.yaml",
        "outcome": "resolved",
        "time_to_resolution": 18
    }

    resolve_res = client.post(f"/api/incidents/{incident_id}/resolve", json=resolution_payload)
    assert resolve_res.status_code == 200
    resolve_data = resolve_res.json()

    assert resolve_data["incident_id"] == incident_id
    assert resolve_data["hindsight_retained"] is True

    # 4. Search Hindsight memory bank to verify newly stored knowledge
    search_res = client.get("/api/memories/search?query=Payment+API+DB-504")
    assert search_res.status_code == 200
    search_data = search_res.json()

    assert search_data["count"] > 0
    assert len(search_data["results"]) > 0
