import logging
from app.core.config import settings
from app.services.llm.base import LLMProvider
from app.services.llm.groq_provider import GroqProvider
from app.services.llm.openai_provider import OpenAIProvider
from app.services.llm.gemini_provider import GeminiProvider

logger = logging.getLogger("incident_memory.llm.factory")


class LLMFactory:
    """Factory for instantiating the configured LLM provider strategy."""

    @staticmethod
    def get_provider(provider_name: str = None) -> LLMProvider:
        name = (provider_name or settings.LLM_PROVIDER or "groq").lower()

        if name == "openai":
            logger.info("Initializing OpenAI LLM Provider")
            return OpenAIProvider()
        elif name == "gemini":
            logger.info("Initializing Gemini LLM Provider")
            return GeminiProvider()
        else:
            logger.info(f"Initializing Groq LLM Provider (Requested: '{name}')")
            return GroqProvider()
