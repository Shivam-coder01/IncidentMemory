from abc import ABC, abstractmethod
from typing import Dict, Any, List


class LLMProvider(ABC):
    """Abstract base class for configurable LLM providers (Groq, OpenAI, Gemini)."""

    @abstractmethod
    def generate_investigation(
        self,
        current_incident: Dict[str, Any],
        formatted_memories: str,
    ) -> Dict[str, Any]:
        """
        Generate structured incident investigation output using current incident data
        and formatted Hindsight memories.
        """
        pass
