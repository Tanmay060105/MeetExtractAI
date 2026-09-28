import pytest
import pytest_asyncio
import uuid
import csv
import io
import json
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.meeting import Meeting
from app.models.action_item import ActionItem, ActionStatus, ValidationStatus, ReviewStatus

@pytest_asyncio.fixture
async def sample_action_items(db_session: AsyncSession, normal_user_token_headers):
    import jwt
    from app.core.config import settings
    token = normal_user_token_headers["Authorization"].replace("Bearer ", "")
    payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    user_id = payload.get("sub")
    # Create meeting
    meeting = Meeting(
        id=uuid.uuid4(),
        user_id=uuid.UUID(user_id),
        title="Export Test Meeting",
        processing_status="COMPLETED"
    )
    db_session.add(meeting)
    await db_session.commit()
    
    # Create action items with interesting characters
    items = []
    for i in range(3):
        item = ActionItem(
            id=uuid.uuid4(),
            meeting_id=meeting.id,
            task=f"Task {i} with comma, and \"quotes\", and\nnewlines!",
            owner_name="Alice O'Brien",
            status=ActionStatus.PENDING,
            confidence=0.95,
            validation_status=ValidationStatus.VALID,
            review_status=ReviewStatus.REVIEWED
        )
        items.append(item)
        db_session.add(item)
    
    await db_session.commit()
    for item in items:
        await db_session.refresh(item)
        
    return items

@pytest_asyncio.fixture
async def other_user_action_items(db_session: AsyncSession):
    from app.models.user import User
    from app.core.security import get_password_hash
    other_user = User(
        email="other.export@example.com",
        full_name="Other User",
        hashed_password=get_password_hash("password")
    )
    db_session.add(other_user)
    await db_session.commit()
    
    meeting = Meeting(
        id=uuid.uuid4(),
        user_id=other_user.id,
        title="Other User Meeting",
        processing_status="COMPLETED"
    )
    db_session.add(meeting)
    await db_session.commit()
    
    item = ActionItem(
        id=uuid.uuid4(),
        meeting_id=meeting.id,
        task="Unauthorized Task",
        status=ActionStatus.PENDING,
        validation_status=ValidationStatus.VALID,
        review_status=ReviewStatus.REVIEWED
    )
    db_session.add(item)
    await db_session.commit()
    await db_session.refresh(item)
    
    return [item]


@pytest.mark.asyncio
async def test_export_csv_success(async_client: AsyncClient, normal_user_token_headers, sample_action_items):
    # Test ordering too! Let's reverse the order of items.
    ids = [str(item.id) for item in reversed(sample_action_items)]
    
    response = await async_client.post(
        "/api/v1/export/action-items",
        headers=normal_user_token_headers,
        json={"format": "csv", "action_item_ids": ids}
    )
    
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "text/csv; charset=utf-8"
    assert "attachment; filename=\"action_items_export.csv\"" in response.headers["Content-Disposition"]
    
    # Check UTF-8 decoding
    text = response.content.decode("utf-8")
    
    # Parse CSV
    f = io.StringIO(text)
    reader = csv.DictReader(f)
    rows = list(reader)
    
    assert len(rows) == 3
    # Check fields and order
    for i, row in enumerate(rows):
        expected_item = sample_action_items[2 - i]
        assert row["ID"] == str(expected_item.id)
        assert row["Task"] == expected_item.task
        assert row["Meeting"] == "Export Test Meeting"
        assert row["Extracted Owner"] == "Alice O'Brien"
        assert row["Assigned Owner"] == ""  # No participant assigned
        assert row["Status"] == "PENDING"
        assert row["Confidence"] == "0.95"


@pytest.mark.asyncio
async def test_export_json_success(async_client: AsyncClient, normal_user_token_headers, sample_action_items):
    ids = [str(sample_action_items[1].id), str(sample_action_items[0].id)]
    
    response = await async_client.post(
        "/api/v1/export/action-items",
        headers=normal_user_token_headers,
        json={"format": "json", "action_item_ids": ids}
    )
    
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "application/json"
    assert "attachment; filename=\"action_items_export.json\"" in response.headers["Content-Disposition"]
    
    data = response.json()
    assert len(data) == 2
    
    # Verify order
    assert data[0]["id"] == str(sample_action_items[1].id)
    assert data[1]["id"] == str(sample_action_items[0].id)
    
    # Verify JSON structure
    assert "task" in data[0]
    assert "extracted_owner" in data[0]
    assert "assigned_owner" in data[0]
    assert "validation_status" in data[0]


@pytest.mark.asyncio
async def test_export_empty_list(async_client: AsyncClient, normal_user_token_headers):
    response = await async_client.post(
        "/api/v1/export/action-items",
        headers=normal_user_token_headers,
        json={"format": "csv", "action_item_ids": []}
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_export_nonexistent_id(async_client: AsyncClient, normal_user_token_headers, sample_action_items):
    ids = [str(sample_action_items[0].id), str(uuid.uuid4())]
    response = await async_client.post(
        "/api/v1/export/action-items",
        headers=normal_user_token_headers,
        json={"format": "json", "action_item_ids": ids}
    )
    # Should be 403 or 404. We chose 403 for unauthorized/not found combined.
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_export_unauthorized_id(async_client: AsyncClient, normal_user_token_headers, sample_action_items, other_user_action_items):
    ids = [str(sample_action_items[0].id), str(other_user_action_items[0].id)]
    response = await async_client.post(
        "/api/v1/export/action-items",
        headers=normal_user_token_headers,
        json={"format": "csv", "action_item_ids": ids}
    )
    # Should reject the entire request if ANY ID is unauthorized
    assert response.status_code == 403
