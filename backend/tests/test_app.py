import pytest
from unittest.mock import patch, Mock
from fastapi.testclient import TestClient

with patch('google.genai.Client'), \
     patch('langchain_google_genai.ChatGoogleGenerativeAI'), \
     patch('redis.Redis.from_url'):
    from src.agent.app import app

client = TestClient(app)

def test_ping():
    response = client.get("/ping")
    assert response.status_code == 200
    assert response.json() == {"message": "pong"}

def test_ping_response_format():
    response = client.get("/ping")
    data = response.json()
    assert "message" in data
    assert isinstance(data["message"], str)