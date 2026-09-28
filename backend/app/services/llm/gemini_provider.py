import json
import logging
import httpx
from typing import Dict, Any
from app.services.llm.base import LLMProvider
from app.prompts.investigation_prompt import SYSTEM_PROMPT, build_investigation_user_prompt
from app.core.config import settings

logger = logging.getLogger("incident_memory.llm.gemini")


class GeminiProvider(LLMProvider):
    """Google Gemini API provider implementation."""

    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = api_key or settings.LLM_API_KEY
        self.model = model or settings.LLM_MODEL or "gemini-1.5-flash"

    def generate_investigation(
        self,
        current_incident: Dict[str, Any],
        formatted_memories: str,
    ) -> Dict[str, Any]:
        user_prompt = build_investigation_user_prompt(current_incident, formatted_memories)

        if not self.api_key or self.api_key.startswith("your_"):
            logger.warning("No Gemini API key configured. Using fallback engine.")
            from app.services.llm.groq_provider import GroqProvider
            return GroqProvider()._generate_fallback_investigation(current_incident, formatted_memories)

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"{SYSTEM_PROMPT}\n\n{user_prompt}"}
                    ]
                }
            ],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.2
            }
        }

        try:
            with httpx.Client(timeout=20.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    text_content = res.json()["candidates"][0]["content"]["parts"][0]["text"]
                    return json.loads(text_content)
        except Exception as e:
            logger.error(f"Gemini API error: {e}")

        from app.services.llm.groq_provider import GroqProvider
        return GroqProvider()._generate_fallback_investigation(current_incident, formatted_memories)
