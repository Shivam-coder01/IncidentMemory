from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db
from app.core.config import settings
from app.schemas.health import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
def get_health(db: Session = Depends(get_db)):
    """Health check endpoint to verify database connectivity and environment config."""
    db_status = "ok"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"error: {str(e)}"

    return HealthResponse(
        status="ok" if db_status == "ok" else "degraded",
        app=settings.APP_NAME,
        environment=settings.ENVIRONMENT,
        database=db_status,
        hindsight_configured=bool(settings.HINDSIGHT_API_URL),
        llm_provider=settings.LLM_PROVIDER,
    )
