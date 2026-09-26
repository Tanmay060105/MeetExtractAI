import pytest
from httpx import AsyncClient
from typing import Dict
import uuid

@pytest.mark.asyncio
async def test_error_paths(
    async_client: AsyncClient,
    normal_user_token_headers: Dict[str, str],
):
    # 1. Invalid auth
    response = await async_client.get(
        "/api/v1/meetings",
        headers={"Authorization": "Bearer invalid_token"}
    )
    assert response.status_code == 401

    # 2. Invalid upload format (we'll just test the route rejection)
    response = await async_client.post(
        "/api/v1/meetings/text",
        headers=normal_user_token_headers,
        json={"title": "Empty Text", "text": "   "} # Only whitespace
    )
    assert response.status_code == 400

    # 3. Nonexistent resource for meeting
    fake_id = str(uuid.uuid4())
    response = await async_client.get(
        f"/api/v1/meetings/{fake_id}",
        headers=normal_user_token_headers
    )
    assert response.status_code == 404

    # 4. Invalid review operation (nonexistent action item)
    response = await async_client.post(
        f"/api/v1/reviews/{fake_id}",
        headers=normal_user_token_headers,
        json={"decision": "APPROVED", "edited_task": None}
    )
    assert response.status_code == 404
    
    # 5. Empty export
    response = await async_client.post(
        "/api/v1/export/action-items",
        headers=normal_user_token_headers,
        json={
            "action_item_ids": [],
            "format": "csv"
        }
    )
    assert response.status_code == 400
