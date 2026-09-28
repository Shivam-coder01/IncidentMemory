from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.db.session import engine, Base
from app.models import incident  # Ensures models are imported for metadata table creation
from app.api.routers import health, incidents, investigate, memories

# Setup logging configuration
setup_logging()

# Initialize FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="IncidentMemory — AI Production Incident Investigator with Persistent Hindsight Memory",
    version="1.0.0",
)

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables on startup
@app.on_event("startup")
def startup_db():
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized successfully.")

# Include Routers
app.include_router(health.router)
app.include_router(incidents.router)
app.include_router(investigate.router)
app.include_router(memories.router)

@app.get("/")
def root():
    return {
        "message": "Welcome to IncidentMemory API",
        "docs": "/docs",
        "health": "/health",
        "tagline": "Every incident becomes knowledge for the next one."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
