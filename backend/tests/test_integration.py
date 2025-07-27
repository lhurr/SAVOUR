import pytest
import os
from fastapi.testclient import TestClient
from unittest.mock import patch, Mock
from langchain_core.messages import HumanMessage

os.environ["GEMINI_API_KEY"] = "test-api-key"

with patch('google.genai.Client'), \
     patch('langchain_google_genai.ChatGoogleGenerativeAI'), \
     patch('redis.Redis.from_url'):
    from src.agent.app import app

client = TestClient(app)

@pytest.mark.integration
class TestAPIIntegration:
    def test_ping_endpoint_integration(self):
        response = client.get("/ping")
        assert response.status_code == 200
        assert response.json() == {"message": "pong"}

    def test_research_topic_integration(self):
        from src.agent.utils import get_research_topic
        
        mock_messages = [HumanMessage(content="Test message")]
        result = get_research_topic(mock_messages)
        
        assert result == "Test message"

    def test_url_resolution_integration(self):
        from src.agent.utils import resolve_urls
        
        mock_site = Mock()
        mock_site.web.uri = "https://test.com"
        
        result = resolve_urls([mock_site], 1)
        expected = {"https://test.com": "https://vertexaisearch.cloud.google.com/id/1-0"}
        assert result == expected

    def test_citation_integration(self):
        from src.agent.utils import insert_citation_markers
        
        text = "This is a test"
        citations = [{
            "start_index": 5,
            "end_index": 7,
            "segments": [{"label": "Test", "short_url": "http://test.com"}]
        }]
        
        result = insert_citation_markers(text, citations)
        assert "[Test](http://test.com)" in result

    def test_empty_data_handling(self):
        from src.agent.utils import get_research_topic, resolve_urls, get_citations
        
        assert get_research_topic([]) == "No research topic provided"
        assert resolve_urls([], 1) == {}
        assert get_citations(None, {}) == []