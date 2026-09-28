import sys
from pathlib import Path

# Ensure backend folder is in python path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.services.hindsight.memory_service import HindsightMemoryService


def test_hindsight_retain_and_recall():
    """
    Test Phase 2 requirement:
    1. Store a realistic incident into Hindsight memory service.
    2. Query Hindsight using relevant symptoms.
    3. Retrieve the matching incident.
    4. Verify that root cause and resolution match.
    """
    # Initialize isolated test memory service
    service = HindsightMemoryService(bank_id="test-incident-bank")

    # Step 1: Retain realistic incident
    retain_result = service.retain_incident(
        incident_id="INC-017",
        service="Payment API",
        environment="Production",
        error_code="DB-504",
        error_message="Database connection pool timeout limit exceeded (10000ms)",
        description="Payment checkout failing for 15% of users with DB connection timeout errors",
        root_cause="Connection pool exhaustion under high concurrency",
        resolution="Increased connection pool size from 20 to 50 in pool_config.yaml",
        outcome="resolved",
        time_to_resolution=18,
        deployment_version="v2.4.1"
    )

    assert retain_result["status"] == "success"
    assert retain_result["incident_id"] == "INC-017"

    # Step 2: Query Hindsight using keywords
    recalled = service.recall_incidents(
        query="Payment API database connection timeout DB-504",
        service="Payment API"
    )

    # Step 3: Verify retrieval
    assert len(recalled) > 0
    matched_incident = recalled[0]

    # Step 4: Verify details
    assert "Payment API" in matched_incident.get("content", str(matched_incident)) or matched_incident.get("service") == "Payment API"
    assert "DB-504" in matched_incident.get("content", str(matched_incident)) or matched_incident.get("error_code") == "DB-504"

    # Step 5: Test prompt formatting helper
    formatted_prompt = service.format_memories_for_prompt(recalled)
    assert "INC-017" in formatted_prompt
    assert "Connection pool exhaustion" in formatted_prompt
    assert "Increased connection pool size from 20 to 50" in formatted_prompt


def test_hindsight_reflect():
    """Test Hindsight reflection functionality for pattern detection."""
    service = HindsightMemoryService(bank_id="test-incident-bank")

    service.retain_incident(
        incident_id="INC-023",
        service="Payment API",
        environment="Production",
        error_code="DB-504",
        error_message="Connection pool utilization reached 100%",
        description="DB-504 recurring issue after traffic spike",
        root_cause="Insufficient DB connections during peak load",
        resolution="Added read replica and connection pool tuning",
        outcome="resolved",
        time_to_resolution=25
    )

    reflection = service.reflect_on_incidents("Payment API DB-504 connection pool")
    assert reflection is not None
    assert "query" in reflection
