import sys
from pathlib import Path

# Ensure backend folder is in python path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.prompts.investigation_prompt import SYSTEM_PROMPT, build_investigation_user_prompt
from app.services.llm.factory import LLMFactory
from app.services.llm.groq_provider import GroqProvider


def test_system_prompt_loading():
    """Verify system prompt contains core IncidentMemory directives."""
    assert "You are IncidentMemory" in SYSTEM_PROMPT
    assert "persistent Hindsight memory" in SYSTEM_PROMPT
    assert "incident_summary" in SYSTEM_PROMPT


def test_user_prompt_building():
    """Verify user prompt correctly formats current telemetry and Hindsight memories."""
    incident = {
        "service": "Payment API",
        "environment": "Production",
        "error_code": "DB-504",
        "error_message": "Connection timeout limit exceeded",
        "description": "Payment checkout failing",
        "deployment_version": "v2.4.1"
    }
    memories = "--- HISTORICAL MEMORY #1 ---\nIncident ID: INC-017\nService: Payment API\nRoot Cause: Pool exhaustion"

    prompt = build_investigation_user_prompt(incident, memories)
    assert "Payment API" in prompt
    assert "DB-504" in prompt
    assert "INC-017" in prompt


def test_llm_factory():
    """Verify LLM Factory instantiates appropriate provider based on config string."""
    groq = LLMFactory.get_provider("groq")
    assert isinstance(groq, GroqProvider)

    openai = LLMFactory.get_provider("openai")
    assert openai is not None

    gemini = LLMFactory.get_provider("gemini")
    assert gemini is not None


def test_investigation_generation():
    """Verify LLM provider produces valid structured investigation output."""
    provider = LLMFactory.get_provider("groq")

    incident = {
        "service": "Payment API",
        "environment": "Production",
        "error_code": "DB-504",
        "error_message": "Database connection pool timeout limit exceeded (10000ms)",
        "description": "Payment checkout failing for users under high load",
        "deployment_version": "v2.4.1"
    }
    memories = (
        "--- HISTORICAL MEMORY #1 ---\n"
        "Incident ID: INC-017\n"
        "Service: Payment API\n"
        "Error Code: DB-504\n"
        "Root Cause: Connection pool exhaustion\n"
        "Resolution: Increased pool size from 20 to 50\n"
    )

    result = provider.generate_investigation(incident, memories)

    assert result is not None
    assert "incident_summary" in result
    assert "recommended_investigation_steps" in result
    assert "possible_root_causes" in result
    assert "confidence_level" in result
    assert len(result["recommended_investigation_steps"]) > 0
