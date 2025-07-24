import pytest
import os
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch

os.environ["GEMINI_API_KEY"] = "test-api-key"
os.environ["REDIS_URL"] = "redis://localhost:6379/0"

@pytest.fixture(autouse=True)
def mock_environment():
    with patch.dict(os.environ, {
        "GEMINI_API_KEY": "test-api-key",
        "REDIS_URL": "redis://localhost:6379/0"
    }):
        yield

@pytest.fixture(autouse=True)
def mock_external_dependencies():
    with patch('google.genai.Client'), \
         patch('langchain_google_genai.ChatGoogleGenerativeAI'), \
         patch('redis.Redis.from_url'):
        yield

@pytest.fixture
def mock_messages():
    return [
        Mock(content="What are the best restaurants in San Francisco?"),
        Mock(content="I'm looking for Italian cuisine")
    ]

@pytest.fixture
def mock_web_search_results():
    return [
        {
            "title": "Best Italian Restaurants SF",
            "url": "https://example.com/italian-sf",
            "snippet": "Top Italian restaurants in San Francisco"
        }
    ]

@pytest.fixture
def mock_resolved_urls():
    return {
        "https://example.com/italian-sf": "https://vertexaisearch.cloud.google.com/id/1-0"
    }

@pytest.fixture
def mock_gemini_response():
    mock_response = Mock()
    mock_response.candidates = [Mock()]
    mock_response.candidates[0].grounding_metadata = Mock()
    mock_response.candidates[0].grounding_metadata.grounding_supports = []
    mock_response.candidates[0].grounding_metadata.grounding_chunks = []
    return mock_response