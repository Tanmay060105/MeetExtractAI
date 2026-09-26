import pytest
from httpx import AsyncClient
from typing import Dict
from unittest.mock import AsyncMock, patch

from app.schemas.extraction import ExtractionResult, ExtractedAction
from app.models.action_item import ActionStatus

@pytest.mark.asyncio
@patch("app.services.ai.gemini_provider.GeminiProvider.extract_action_items", new_callable=AsyncMock)
async def test_authenticated_user_isolation(
    mock_extract_action_items,
    async_client: AsyncClient,
    normal_user_token_headers: Dict[str, str],
    admin_token_headers: Dict[str, str], # Using "admin" just as User B
):
    # 1. Mock the extraction response
    mock_action = ExtractedAction(
        task="User A private task",
        owner_name="User A",
        deadline=None,
        status=ActionStatus.PENDING,
        confidence=0.5,
        evidence="Private evidence",
        source_location=None
    )
    mock_extract_action_items.return_value = ExtractionResult(actions=[mock_action])

    user_a_headers = normal_user_token_headers
    user_b_headers = admin_token_headers

    # 2. User A creates a meeting
    response = await async_client.post(
        "/api/v1/meetings/text",
        headers=user_a_headers,
        json={"title": "User A Meeting", "text": "This is a private meeting for A."}
    )
    assert response.status_code == 201
    meeting_a = response.json()
    meeting_a_id = meeting_a["id"]

    # 3. User B attempts to view User A's meeting
    response = await async_client.get(
        f"/api/v1/meetings/{meeting_a_id}",
        headers=user_b_headers
    )
    # Existing API contract returns 404 if not found or not owned
    assert response.status_code == 404

    # 4. Fetch User A's action items
    response = await async_client.get(
        "/api/v1/action-items",
        headers=user_a_headers
    )
    items_a = response.json()
    assert len(items_a) == 1
    action_item_a_id = items_a[0]["id"]

    # 5. User B attempts to fetch User A's action items directly
    # Note: /action-items lists only owned items.
    response = await async_client.get(
        "/api/v1/action-items",
        headers=user_b_headers
    )
    items_b = response.json()
    assert len(items_b) == 0 # User B should see 0 items

    # 6. User B attempts to access User A's review queue
    response = await async_client.get(
        "/api/v1/reviews/pending",
        headers=user_b_headers
    )
    assert len(response.json()) == 0

    # 7. User B attempts to review User A's action item
    response = await async_client.post(
        f"/api/v1/reviews/{action_item_a_id}",
        headers=user_b_headers,
        json={"decision": "APPROVED", "edited_task": None}
    )
    assert response.status_code == 404

    # 8. User B attempts to export User A's action item
    response = await async_client.post(
        "/api/v1/export/action-items",
        headers=user_b_headers,
        json={
            "action_item_ids": [action_item_a_id],
            "format": "csv"
        }
    )
    assert response.status_code == 403 # Export raises 403 on unowned
