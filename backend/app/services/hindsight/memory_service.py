import logging
import httpx
from typing import List, Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("incident_memory.hindsight")


class HindsightMemoryService:
    """Service abstraction for persistent organizational memory powered by Hindsight."""

    def __init__(
        self,
        api_url: Optional[str] = None,
        bank_id: Optional[str] = None,
        api_key: Optional[str] = None,
    ):
        self.api_url = (api_url or settings.HINDSIGHT_API_URL).rstrip("/")
        self.bank_id = bank_id or settings.HINDSIGHT_BANK_ID
        self.api_key = api_key or settings.HINDSIGHT_API_KEY
        self.headers = {"Content-Type": "application/json"}
        if self.api_key:
            self.headers["Authorization"] = f"Bearer {self.api_key}"
        
        # Local mock storage fallback when running offline without external server
        self._local_fallback_memories: List[Dict[str, Any]] = []

    def is_available(() -> bool:
        """Verify if external Hindsight service is reachable."""
        try:
            with httpx.Client(timeout=2.0) as client:
                res = client.get(f"{self.api_url}/health", headers=self.headers)
                return res.status_code == 200
        except Exception as e:
            logger.warning(f"Hindsight server health check failed ({self.api_url}): {e}")
            return False

    def retain_incident(
        self,
        incident_id: str,
        service: str,
        environment: str,
        error_code: str,
        error_message: str,
        description: str,
        root_cause: str,
        resolution: str,
        outcome: str = "resolved",
        time_to_resolution: Optional[int] = None,
        deployment_version: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Retain useful incident knowledge into Hindsight.
        Converts incident data into a structured memory document before storing.
        """
        content_text = (
            f"Incident ID: {incident_id}\n"
            f"Service: {service}\n"
            f"Environment: {environment}\n"
            f"Error Code: {error_code or 'N/A'}\n"
            f"Deployment Version: {deployment_version or 'N/A'}\n"
            f"Error Message: {error_message}\n"
            f"Description: {description}\n"
            f"Root Cause: {root_cause}\n"
            f"Resolution: {resolution}\n"
            f"Outcome: {outcome}\n"
            f"Time to Resolution: {time_to_resolution or 'Unknown'} minutes\n"
        )

        payload = {
            "bank_id": self.bank_id,
            "content": content_text,
            "metadata": {
                "incident_id": incident_id,
                "service": service,
                "error_code": error_code,
                "environment": environment,
                "outcome": outcome,
                "root_cause": root_cause,
                "resolution": resolution,
            },
        }

        memory_record = {
            "incident_id": incident_id,
            "service": service,
            "environment": environment,
            "error_code": error_code,
            "error_message": error_message,
            "description": description,
            "root_cause": root_cause,
            "resolution": resolution,
            "outcome": outcome,
            "time_to_resolution": time_to_resolution,
            "content": content_text,
            "retained_at": "now",
        }

        # Attempt retention to official Hindsight API
        try:
            with httpx.Client(timeout=5.0) as client:
                response = client.post(
                    f"{self.api_url}/v1/banks/{self.bank_id}/retain",
                    json=payload,
                    headers=self.headers,
                )
                if response.status_code in (200, 201):
                    logger.info(f"Successfully retained incident {incident_id} in Hindsight bank '{self.bank_id}'")
                    # Also keep local copy
                    self._local_fallback_memories.append(memory_record)
                    return {"status": "success", "source": "hindsight_api", "incident_id": incident_id}
                else:
                    logger.warning(f"Hindsight API retain returned status {response.status_code}. Using fallback.")
        except Exception as e:
            logger.warning(f"Could not connect to Hindsight API for retain: {e}. Storing in local memory fallback.")

        # Fallback retention
        self._local_fallback_memories.append(memory_record)
        return {"status": "success", "source": "local_fallback", "incident_id": incident_id}

    def recall_incidents(
        self,
        query: str,
        service: Optional[str] = None,
        limit: int = 5,
    ) -> List[Dict[str, Any]]:
        """
        Recall relevant historical incident memories from Hindsight based on search query.
        """
        payload = {
            "bank_id": self.bank_id,
            "query": query,
            "limit": limit,
        }

        # Attempt recall from official Hindsight API
        try:
            with httpx.Client(timeout=5.0) as client:
                response = client.post(
                    f"{self.api_url}/v1/banks/{self.bank_id}/recall",
                    json=payload,
                    headers=self.headers,
                )
                if response.status_code == 200:
                    data = response.json()
                    results = data.get("results", [])
                    logger.info(f"Retrieved {len(results)} memories from Hindsight API for query: '{query}'")
                    return results
        except Exception as e:
            logger.warning(f"Hindsight API recall failed: {e}. Searching local memory fallback.")

        # Local fallback search based on simple keyword matching
        query_terms = set(query.lower().split())
        matched = []
        for mem in self._local_fallback_memories:
            content_lower = mem["content"].lower()
            score = sum(1 for term in query_terms if term in content_lower)
            if score > 0 or (service and mem["service"].lower() == service.lower()):
                matched.append({**mem, "score": score})

        # Sort by match score descending
        matched.sort(key=lambda x: x.get("score", 0), reverse=True)
        return matched[:limit]

    def reflect_on_incidents(self, query: str) -> Dict[str, Any]:
        """
        Reflect over stored memories to synthesize high-level patterns and beliefs.
        """
        payload = {
            "bank_id": self.bank_id,
            "query": query,
        }

        try:
            with httpx.Client(timeout=5.0) as client:
                response = client.post(
                    f"{self.api_url}/v1/banks/{self.bank_id}/reflect",
                    json=payload,
                    headers=self.headers,
                )
                if response.status_code == 200:
                    return response.json()
        except Exception as e:
            logger.warning(f"Hindsight reflect API call failed: {e}")

        # Fallback reflect response
        memories = self.recall_incidents(query)
        summary = f"Reflected on {len(memories)} matching incidents for query '{query}'."
        return {
            "query": query,
            "summary": summary,
            "memories_analyzed": len(memories),
            "source": "fallback_reflection",
        }

    def format_memories_for_prompt(self, memories: List[Dict[str, Any]]) -> str:
        """
        Format retrieved Hindsight memories into clean structured text for LLM system prompt context.
        """
        if not memories:
            return "No historical incident memories found matching this situation."

        formatted_blocks = []
        for idx, mem in enumerate(memories, start=1):
            if "content" in mem:
                block = f"--- HISTORICAL MEMORY #{idx} ---\n{mem['content'].strip()}"
            else:
                block = (
                    f"--- HISTORICAL MEMORY #{idx} ---\n"
                    f"Incident ID: {mem.get('incident_id', 'N/A')}\n"
                    f"Service: {mem.get('service', 'N/A')}\n"
                    f"Error Code: {mem.get('error_code', 'N/A')}\n"
                    f"Root Cause: {mem.get('root_cause', 'N/A')}\n"
                    f"Resolution: {mem.get('resolution', 'N/A')}\n"
                    f"Outcome: {mem.get('outcome', 'N/A')}\n"
                )
            formatted_blocks.append(block)

        return "\n\n".join(formatted_blocks)


# Singleton instance for app dependency injection
hindsight_service = HindsightMemoryService()
