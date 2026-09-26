import pytest
from httpx import AsyncClient
from typing import Dict
from unittest.mock import AsyncMock, patch

from app.schemas.extraction import ExtractionResult, ExtractedAction
from app.models.action_item import ActionStatus, ValidationStatus, ReviewStatus

@pytest.mark.asyncio
@patch("app.services.ai.gemini_provider.GeminiProvider.extract_action_items", new_callable=AsyncMock)
async def test_critical_product_workflow(
    mock_extract_action_items,
    async_client: AsyncClient,
    normal_user_token_headers: Dict[str, str],
):
    # 1. Mock the extraction response
    mock_action = ExtractedAction(
        task="Finish the Phase 13 integration tests",
        owner_name="Test User",
        deadline=None,
        status=ActionStatus.PENDING,
        confidence=0.5, # Low confidence to trigger NEEDS_REVIEW
        evidence="I will finish the tests by tomorrow.",
        source_location=None
    )
    mock_extract_action_items.return_value = ExtractionResult(actions=[mock_action])

    # 2. Meeting Text Submission (Creation)
    response = await async_client.post(
        "/api/v1/meetings/text",
        headers=normal_user_token_headers,
        json={"title": "Integration Test Meeting", "text": "I will finish the tests by tomorrow."}
    )
    assert response.status_code == 201
    meeting_data = response.json()
    meeting_id = meeting_data["id"]
    
    assert meeting_data["title"] == "Integration Test Meeting"
    
    # 3. Retrieve Action Items (Background extraction ran automatically)
    response = await async_client.get(
        "/api/v1/action-items",
        headers=normal_user_token_headers
    )
    assert response.status_code == 200
    items = response.json()
    
    assert len(items) == 1
    item = items[0]
    action_item_id = item["id"]
    
    # 4. Verify State Separation Integrity
    # PENDING status from extraction
    assert item["status"] == "PENDING"
    # Low confidence or unknown owner triggers review
    assert item["validation_status"] == "UNKNOWN"
    assert item["review_status"] == "NEEDS_REVIEW"
    
    # 5. Review
    # First, get pending reviews
    response = await async_client.get(
        "/api/v1/reviews/pending",
        headers=normal_user_token_headers
    )
    assert response.status_code == 200
    pending_reviews = response.json()
    assert len(pending_reviews) == 1
    assert pending_reviews[0]["id"] == action_item_id
    
    # Submit review decision
    response = await async_client.post(
        f"/api/v1/reviews/{action_item_id}",
        headers=normal_user_token_headers,
        json={"decision": "APPROVED", "edits": None}
    )
    assert response.status_code == 200
    review_response = response.json()
    
    # Fetch action item again to check state
    response = await async_client.get(
        "/api/v1/action-items",
        headers=normal_user_token_headers
    )
    items = response.json()
    updated_item = items[0]
    
    # API Contract Check (Frontend interface expectation)
    assert "id" in updated_item
    assert "meeting_id" in updated_item
    assert "task" in updated_item
    assert "owner_name" in updated_item
    assert "deadline" in updated_item
    assert "status" in updated_item
    assert "confidence" in updated_item
    assert "evidence" in updated_item
    assert "source_location" in updated_item
    assert "validation_status" in updated_item
    assert "review_status" in updated_item
    
    # State verification post-review
    assert updated_item["status"] == "PENDING" # Remains PENDING (from Extraction)
    assert updated_item["validation_status"] == "UNKNOWN" # Original validation state is preserved
    assert updated_item["review_status"] == "REVIEWED" # Review status moved to REVIEWED
    
    # 6. Analytics
    response = await async_client.get(
        "/api/v1/analytics/dashboard",
        headers=normal_user_token_headers
    )
    assert response.status_code == 200
    analytics_data = response.json()
    assert analytics_data["total_meetings"] == 1
    assert analytics_data["total_action_items"] == 1
    assert analytics_data["needs_review"] == 0 # Review was completed
    
    # 7. Evaluation Integration (Deterministic call)
    response = await async_client.post(
        "/api/v1/evaluations/datasets",
        headers=normal_user_token_headers,
        json={
            "name": "Integration Eval",
            "description": "Integration test dataset",
            "version": "1.0"
        }
    )
    assert response.status_code == 201
    
    # 8. Export the current Action Items subset
    response = await async_client.post(
        "/api/v1/export/action-items",
        headers=normal_user_token_headers,
        json={
            "action_item_ids": [action_item_id],
            "format": "json"
        }
    )
    assert response.status_code == 200
    export_data = response.json()
    assert len(export_data) == 1
    assert export_data[0]["task"] == "Finish the Phase 13 integration tests"
