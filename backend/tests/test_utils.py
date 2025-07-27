import pytest
from unittest.mock import Mock, patch
import os
from langchain_core.messages import HumanMessage, AIMessage

os.environ["GEMINI_API_KEY"] = "test-api-key"

with patch('google.genai.Client'), \
     patch('langchain_google_genai.ChatGoogleGenerativeAI'), \
     patch('redis.Redis.from_url'):
    from src.agent.utils import (
        get_research_topic,
        resolve_urls,
        insert_citation_markers,
        get_citations
    )

class TestGetResearchTopic:
    def test_empty_messages(self):
        result = get_research_topic([])
        assert result == "No research topic provided"

    def test_single_message(self):
        message = HumanMessage(content="What are the best restaurants in San Francisco?")
        result = get_research_topic([message])
        assert result == "What are the best restaurants in San Francisco?"

    def test_multiple_messages(self):
        messages = [
            HumanMessage(content="What are the best restaurants in San Francisco?"),
            HumanMessage(content="I'm looking for Italian cuisine")
        ]
        result = get_research_topic(messages)
        assert "User: What are the best restaurants in San Francisco?" in result
        assert "User: I'm looking for Italian cuisine" in result

    def test_none_messages(self):
        result = get_research_topic(None)
        assert result == "No research topic provided"

    def test_mixed_message_types(self):
        messages = [
            HumanMessage(content="What are good restaurants?"),
            AIMessage(content="I can help you find restaurants."),
            HumanMessage(content="I prefer Italian food.")
        ]
        result = get_research_topic(messages)
        assert "User: What are good restaurants?" in result
        assert "Assistant: I can help you find restaurants." in result
        assert "User: I prefer Italian food." in result

class TestResolveUrls:
    def test_empty_urls(self):
        result = resolve_urls([], 1)
        assert result == {}

    def test_resolve_urls_with_valid_data(self):
        mock_site = Mock()
        mock_site.web.uri = "https://example.com"
        
        result = resolve_urls([mock_site], 1)
        expected_url = "https://vertexaisearch.cloud.google.com/id/1-0"
        assert result["https://example.com"] == expected_url

    def test_resolve_urls_with_invalid_data(self):
        mock_site = Mock()
        del mock_site.web
        
        result = resolve_urls([mock_site], 1)
        assert result == {}

    def test_resolve_urls_duplicate_handling(self):
        mock_site1 = Mock()
        mock_site1.web.uri = "https://example.com"
        mock_site2 = Mock()
        mock_site2.web.uri = "https://example.com"  
        
        result = resolve_urls([mock_site1, mock_site2], 1)
        assert len(result) == 1
        assert result["https://example.com"] == "https://vertexaisearch.cloud.google.com/id/1-0"

class TestInsertCitationMarkers:
    def test_insert_single_citation(self):
        text = "This is a test sentence."
        citations = [{
            "start_index": 10,
            "end_index": 14,
            "segments": [{"label": "Source1", "short_url": "http://short.url"}]
        }]
        
        result = insert_citation_markers(text, citations)
        assert "[Source1](http://short.url)" in result

    def test_insert_multiple_citations(self):
        text = "This is a test sentence with multiple citations."
        citations = [
            {
                "start_index": 10,
                "end_index": 14,
                "segments": [{"label": "Source1", "short_url": "http://url1.com"}]
            },
            {
                "start_index": 25,
                "end_index": 33,
                "segments": [{"label": "Source2", "short_url": "http://url2.com"}]
            }
        ]
        
        result = insert_citation_markers(text, citations)
        assert "[Source1](http://url1.com)" in result
        assert "[Source2](http://url2.com)" in result

    def test_empty_citations(self):
        text = "This is a test sentence."
        citations = []
        
        result = insert_citation_markers(text, citations)
        assert result == text

class TestGetCitations:
    def test_empty_response(self):
        result = get_citations(None, {})
        assert result == []

    def test_no_candidates(self):
        mock_response = Mock()
        mock_response.candidates = []
        
        result = get_citations(mock_response, {})
        assert result == []

    def test_no_grounding_metadata(self):
        mock_response = Mock()
        mock_candidate = Mock()
        # Explicitly set grounding_metadata to None to simulate no grounding metadata
        mock_candidate.grounding_metadata = None
        mock_response.candidates = [mock_candidate]
        
        result = get_citations(mock_response, {})
        assert result == []

    def test_valid_citations(self):
        mock_resolved_urls = {
            "https://example.com/italian-sf": "https://vertexaisearch.cloud.google.com/id/1-0"
        }
        
        mock_response = Mock()
        mock_response.candidates = [Mock()]
        
        mock_response.candidates[0].grounding_metadata = Mock()
        
        mock_support = Mock()
        mock_support.segment.start_index = 0
        mock_support.segment.end_index = 10
        mock_support.grounding_chunk_indices = [0]
        
        mock_response.candidates[0].grounding_metadata.grounding_supports = [mock_support]
        
        mock_chunk = Mock()
        mock_chunk.web.uri = "https://example.com/italian-sf"
        mock_chunk.web.title = "Best Italian Restaurants.html"
        
        mock_response.candidates[0].grounding_metadata.grounding_chunks = [mock_chunk]
        
        result = get_citations(mock_response, mock_resolved_urls)
        
        assert len(result) == 1
        assert result[0]["start_index"] == 0
        assert result[0]["end_index"] == 10
        assert len(result[0]["segments"]) == 1
        assert result[0]["segments"][0]["label"] == "Best Italian Restaurants"
        assert result[0]["segments"][0]["short_url"] == "https://vertexaisearch.cloud.google.com/id/1-0"