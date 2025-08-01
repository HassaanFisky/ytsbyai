import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root_endpoint():
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "YTS by AI API"

def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_summary_endpoint_requires_auth():
    """Test that summary endpoint requires authentication"""
    response = client.post("/api/v1/summary", json={"url": "https://youtube.com/watch?v=test"})
    assert response.status_code in [401, 422]  # Either unauthorized or validation error

def test_voice_transcribe_requires_auth():
    """Test that voice transcription requires authentication"""
    response = client.post("/api/v1/voice/transcribe")
    assert response.status_code in [401, 422]

def test_demo_session():
    """Test demo session creation"""
    response = client.get("/api/v1/demo/session")
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert "expires_at" in data

def test_admin_requires_auth():
    """Test that admin endpoints require authentication"""
    response = client.get("/api/v1/admin/analytics")
    assert response.status_code in [401, 403]

def test_feature_requests_list():
    """Test feature requests listing"""
    response = client.get("/api/v1/features")
    assert response.status_code == 200
    data = response.json()
    assert "features" in data
    assert isinstance(data["features"], list)

def test_feedback_submission():
    """Test feedback submission"""
    feedback_data = {
        "type": "bug",
        "title": "Test Bug",
        "description": "This is a test bug report",
        "severity": "low",
        "user_email": "test@example.com"
    }
    response = client.post("/api/v1/feedback", json=feedback_data)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["title"] == "Test Bug" 