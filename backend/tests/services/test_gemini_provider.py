import pytest
from unittest.mock import AsyncMock, patch, MagicMock

from app.services.ai.gemini_provider import GeminiProvider
from app.schemas.extraction import ExtractionResult, ExtractedAction
from app.models.action_item import ActionStatus

@pytest.fixture
def mock_genai_client():
    with patch("app.services.ai.gemini_provider.genai.Client") as mock_client:
        mock_instance = MagicMock()
        mock_aio = MagicMock()
        mock_models = MagicMock()
        
        # Setup generate_content mock
        mock_generate_content = AsyncMock()
        mock_models.generate_content = mock_generate_content
        mock_aio.models = mock_models
        mock_instance.aio = mock_aio
        mock_client.return_value = mock_instance
        yield mock_generate_content

@pytest.mark.asyncio
async def test_extract_action_items_success(mock_genai_client):
    # Setup mock response
    mock_response = MagicMock()
    
    # Create the expected ExtractionResult object
    mock_action = ExtractedAction(
        task="Submit final report",
        owner_name="John Doe",
        deadline=None,
        status=ActionStatus.PENDING,
        confidence=0.9,
        evidence="I will submit the final report.",
        source_location=None
    )
    expected_result = ExtractionResult(actions=[mock_action])
    
    # Set the .parsed property on the mock response to simulate structured output success
    mock_response.parsed = expected_result
    mock_genai_client.return_value = mock_response

    provider = GeminiProvider()
    result = await provider.extract_action_items("I will submit the final report.")
    
    assert isinstance(result, ExtractionResult)
    assert len(result.actions) == 1
    assert result.actions[0].task == "Submit final report"
    assert result.actions[0].owner_name == "John Doe"

@pytest.mark.asyncio
async def test_extract_action_items_fallback_parsing(mock_genai_client):
    # Setup mock response where .parsed is not populated but .text contains JSON
    mock_response = MagicMock()
    del mock_response.parsed # Ensure it doesn't have the attribute
    
    json_payload = '{"actions": [{"task": "Fix bug", "owner_name": "Jane", "deadline": null, "status": "PENDING", "confidence": 0.8, "evidence": "I will fix the bug.", "source_location": null}]}'
    mock_response.text = json_payload
    mock_genai_client.return_value = mock_response

    provider = GeminiProvider()
    result = await provider.extract_action_items("I will fix the bug.")
    
    assert isinstance(result, ExtractionResult)
    assert len(result.actions) == 1
    assert result.actions[0].task == "Fix bug"
    assert result.actions[0].owner_name == "Jane"

@pytest.mark.asyncio
async def test_extract_action_items_with_reference_date(mock_genai_client):
    mock_response = MagicMock()
    mock_action = ExtractedAction(
        task="Do this by tomorrow",
        owner_name=None,
        deadline=None,
        status=ActionStatus.PENDING,
        confidence=0.9,
        evidence="Do this by tomorrow",
        source_location=None
    )
    expected_result = ExtractionResult(actions=[mock_action])
    mock_response.parsed = expected_result
    mock_genai_client.return_value = mock_response

    provider = GeminiProvider()
    from datetime import datetime
    ref_date = datetime(2026, 9, 23, 12, 0, 0)
    await provider.extract_action_items("Do this by tomorrow", reference_date=ref_date)
    
    # Verify the reference date was included in the system prompt
    call_kwargs = mock_genai_client.call_args.kwargs
    system_instruction = call_kwargs["config"].system_instruction
    assert "2026-09-23T12:00:00" in system_instruction

