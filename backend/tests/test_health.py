import sys
from pathlib import Path
from fastapi.testclient import TestClient

# Add backend directory to sys.path for test discovery
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["tagline"] == "Every incident becomes knowledge for the next one."


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "ok"
    assert "app" in data
    assert "llm_provider" in data
