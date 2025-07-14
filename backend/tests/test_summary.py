import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app

client = TestClient(app)

@pytest.fixture
def mock_openai():
    with patch("app.routers.summary.openai") as mock:
        mock.ChatCompletion.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content='{"summary": "Test summary", "title": "Test", "tone": "professional", "cta": "Test CTA"}'))]
        )
        yield mock

@pytest.fixture
def mock_youtube_transcript():
    with patch("app.routers.summary.YouTubeTranscriptApi") as mock:
        mock.get_transcript.return_value = [{"text": "Test transcript"}]
        yield mock

@pytest.fixture
def mock_firebase():
    with patch("app.core.firebase.get_user_record") as mock:
        mock.return_value = {
            "uid": "test_uid",
            "subscription_status": "active",
            "usage_count": 5
        }
        yield mock

def test_create_summary_success(mock_openai, mock_youtube_transcript, mock_firebase):
    """Test successful summary creation"""
    response = client.post(
        "/api/v1/summary",
        json={
            "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "tone": "professional",
            "max_length": 500
        },
        headers={"Authorization": "Bearer test_token"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "title" in data
    assert "tone" in data
    assert "cta" in data

def test_create_summary_invalid_url():
    """Test summary creation with invalid YouTube URL"""
    response = client.post(
        "/api/v1/summary",
        json={
            "youtube_url": "https://invalid-url.com",
            "tone": "professional"
        },
        headers={"Authorization": "Bearer test_token"}
    )
    
    assert response.status_code == 400
    assert "Invalid YouTube URL" in response.json()["detail"]

def test_create_summary_no_auth():
    """Test summary creation without authentication"""
    response = client.post(
        "/api/v1/summary",
        json={
            "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "tone": "professional"
        }
    )
    
    assert response.status_code == 403

def test_get_trial_token():
    """Test trial token generation"""
    response = client.get("/api/v1/trial-token")
    
    assert response.status_code == 200
    data = response.json()
    assert "trial_token" in data
    assert "device_id" in data

def test_rate_limiting():
    """Test rate limiting on summary endpoint"""
    # Make multiple requests to trigger rate limit
    for _ in range(11):
        response = client.post(
            "/api/v1/summary",
            json={
                "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "tone": "professional"
            },
            headers={"Authorization": "Bearer test_token"}
        )
    
    # The 11th request should be rate limited
    assert response.status_code == 429 