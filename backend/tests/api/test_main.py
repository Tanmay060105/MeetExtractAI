from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)

def test_health_check():
    """Test that the application initializes and responds on the health endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "app" in data
    assert "version" in data
    assert data["app"] == settings.APP_NAME

def test_root_endpoint():
    """Test that the root endpoint acts as a health check."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
