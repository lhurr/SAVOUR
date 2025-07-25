import pytest
import os
from unittest.mock import patch

os.environ["GEMINI_API_KEY"] = "test-api-key"

with patch('google.genai.Client'), \
     patch('langchain_google_genai.ChatGoogleGenerativeAI'), \
     patch('redis.Redis.from_url'):
    from src.agent.state import (
        OverallState,
        ReflectionState,
        Query,
        QueryGenerationState,
        WebSearchState,
        SearchStateOutput
    )

class TestOverallState:
    def test_overall_state_structure(self):
        state = OverallState(
            messages=[],
            search_query=[],
            web_research_result=[],
            sources_gathered=[],
            initial_search_query_count=0,
            max_research_loops=3,
            research_loop_count=0,
            reasoning_model="gpt-4"
        )
        
        assert state["messages"] == []
        assert state["search_query"] == []
        assert state["max_research_loops"] == 3
        assert state["reasoning_model"] == "gpt-4"

class TestReflectionState:
    def test_reflection_state_structure(self):
        state = ReflectionState(
            is_sufficient=False,
            knowledge_gap="Need more information about pricing",
            follow_up_queries=[],
            research_loop_count=1,
            number_of_ran_queries=2
        )
        
        assert state["is_sufficient"] is False
        assert state["knowledge_gap"] == "Need more information about pricing"
        assert state["research_loop_count"] == 1

class TestQuery:
    def test_query_structure(self):
        query = Query(
            query="Best restaurants in SF",
            rationale="User is looking for dining recommendations"
        )
        
        assert query["query"] == "Best restaurants in SF"
        assert query["rationale"] == "User is looking for dining recommendations"

class TestQueryGenerationState:
    def test_query_generation_state(self):
        queries = [
            Query(query="Italian restaurants SF", rationale="Specific cuisine"),
            Query(query="Restaurant reviews SF", rationale="Quality assessment")
        ]
        
        state = QueryGenerationState(query_list=queries)
        assert len(state["query_list"]) == 2
        assert state["query_list"][0]["query"] == "Italian restaurants SF"

class TestWebSearchState:
    def test_web_search_state(self):
        state = WebSearchState(
            search_query="best pizza SF",
            id="search_001"
        )
        
        assert state["search_query"] == "best pizza SF"
        assert state["id"] == "search_001"

class TestSearchStateOutput:
    def test_search_state_output_default(self):
        output = SearchStateOutput()
        assert output.running_summary is None

    def test_search_state_output_with_summary(self):
        output = SearchStateOutput(running_summary="Research complete")
        assert output.running_summary == "Research complete"