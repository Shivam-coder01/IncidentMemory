import json
import logging
import httpx
from typing import Dict, Any
from app.services.llm.base import LLMProvider
from app.prompts.investigation_prompt import SYSTEM_PROMPT, build_investigation_user_prompt
from app.core.config import settings

logger = logging.getLogger("incident_memory.llm.openai")


class OpenAIProvider(LLMProvider):
    """OpenAI API provider implementation (GPT-4o / GPT-4o-mini)."""

    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = api_key or settings.LLM_API_KEY
        self.model = model or settings.LLM_MODEL or "gpt-4o-mini"
        self.base_url = "https://api.openai.com/v1/chat/completions"

    def generate_investigation(
        self,
        current_incident: Dict[str, Any],
        formatted_memories: str,
    ) -> Dict[str, Any]:
        user_prompt = build_investigation_user_prompt(current_incident, formatted_memories)

        if not self.api_key or self.api_key.startswith("your_"):
            logger.warning("No OpenAI API key configured. Using fallback engine.")
            from app.services.llm.groq_provider import GroqProvider
            return GroqProvider()._generate_fallback_investigation(current_incident, formatted_memories)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2,
        }

        try:
            with httpx.Client(timeout=20.0) as client:
                res = client.post(self.base_url, headers=headers, json=payload)
                if res.status_code == 200:
                    content = res.json()["choices"][0]["message"]["content"]
                    return json.loads(content)
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")

        from app.services.llm.groq_provider import GroqProvider
        return GroqProvider()._generate_fallback_investigation(current_incident, formatted_memories)
