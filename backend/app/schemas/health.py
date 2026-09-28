from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    app: str
    environment: str
    database: str
    hindsight_configured: bool
    llm_provider: str
