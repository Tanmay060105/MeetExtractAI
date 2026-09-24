import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import status
import uuid
from typing import Any

from app.models.meeting import Meeting, ProcessingStatus
from app.models.transcript import Transcript
from app.models.action_item import ActionItem
from app.services.ai.base import AIProvider
from app.schemas.extraction import ExtractionResult, ExtractedAction
from app.services.extraction import ExtractionService

class MockAIProvider(AIProvider):
    def __init__(self, actions: list[dict], fail: bool = False):
        self.actions = actions
        self.fail = fail
        
from datetime import datetime
from typing import Optional

    async def extract_action_items(self, transcript_text: str, reference_date: Optional[datetime] = None) -> ExtractionResult:
        if self.fail:
            raise Exception("Mock provider failure")
        return ExtractionResult(
            actions=[ExtractedAction(**a) for a in self.actions]
        )

@pytest_asyncio.fixture
async def setup_meeting(db_session: AsyncSession, normal_user_token_headers):
    import jwt
    from app.core.config import settings
    token = normal_user_token_headers["Authorization"].replace("Bearer ", "")
    payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    user_id = payload.get("sub")
    
    meeting = Meeting(
        user_id=uuid.UUID(user_id),
        title="Extraction Test Meeting",
        processing_status=ProcessingStatus.COMPLETED
    )
    db_session.add(meeting)
    await db_session.flush()
    
    transcript = Transcript(
        meeting_id=meeting.id,
        raw_text="Hello test",
        normalized_text="Hello test"
    )
    db_session.add(transcript)
    await db_session.commit()
    
    yield meeting.id
    
    # Teardown to clean up DB
    await db_session.execute(ActionItem.__table__.delete().where(ActionItem.meeting_id == meeting.id))
    await db_session.execute(Transcript.__table__.delete().where(Transcript.meeting_id == meeting.id))
    await db_session.execute(Meeting.__table__.delete().where(Meeting.id == meeting.id))
    await db_session.commit()

@pytest.mark.asyncio
async def test_extract_success_multiple_actions(
    async_client: AsyncClient, 
    normal_user_token_headers: dict[str, str], 
    db_session: AsyncSession,
    setup_meeting: uuid.UUID,
    monkeypatch: Any
):
    # Monkeypatch the extraction service provider
    mock_provider = MockAIProvider([
        {"task": "Do this", "owner_name": "Alice", "confidence": 0.9},
        {"task": "Do that", "owner_name": None, "confidence": 0.8}
    ])
    
    def override_get_default_provider(self):
        return mock_provider
    monkeypatch.setattr(ExtractionService, "_get_default_provider", override_get_default_provider)
    
    response = await async_client.post(
        f"/api/v1/meetings/{setup_meeting}/extract",
        headers=normal_user_token_headers
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["extracted_count"] == 2
    assert data["processing_status"] == "COMPLETED"
    
    # Verify DB state
    actions = (await db_session.execute(select(ActionItem).where(ActionItem.meeting_id == setup_meeting).order_by(ActionItem.task.desc()))).scalars().all()
    assert len(actions) == 2
    assert actions[0].task == "Do this"
    assert actions[0].owner_name == "Alice"
    from app.models.action_item import ValidationStatus
    assert actions[0].validation_status == ValidationStatus.UNKNOWN

@pytest.mark.asyncio
async def test_extract_empty_actions(
    async_client: AsyncClient, 
    normal_user_token_headers: dict[str, str], 
    db_session: AsyncSession,
    setup_meeting: uuid.UUID,
    monkeypatch: Any
):
    mock_provider = MockAIProvider([])
    monkeypatch.setattr(ExtractionService, "_get_default_provider", lambda self: mock_provider)
    
    response = await async_client.post(
        f"/api/v1/meetings/{setup_meeting}/extract",
        headers=normal_user_token_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["extracted_count"] == 0
    assert data["processing_status"] == "COMPLETED"

@pytest.mark.asyncio
async def test_extract_provider_failure(
    async_client: AsyncClient, 
    normal_user_token_headers: dict[str, str], 
    db_session: AsyncSession,
    setup_meeting: uuid.UUID,
    monkeypatch: Any
):
    mock_provider = MockAIProvider([], fail=True)
    monkeypatch.setattr(ExtractionService, "_get_default_provider", lambda self: mock_provider)
    
    response = await async_client.post(
        f"/api/v1/meetings/{setup_meeting}/extract",
        headers=normal_user_token_headers
    )
    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    
    # DB state should be FAILED, no actions
    db_session.expire_all()
    meeting = (await db_session.execute(select(Meeting).where(Meeting.id == setup_meeting))).scalar_one()
    assert meeting.processing_status == ProcessingStatus.FAILED
    actions = (await db_session.execute(select(ActionItem).where(ActionItem.meeting_id == setup_meeting))).scalars().all()
    assert len(actions) == 0

@pytest.mark.asyncio
async def test_extract_already_extracted(
    async_client: AsyncClient, 
    normal_user_token_headers: dict[str, str], 
    db_session: AsyncSession,
    setup_meeting: uuid.UUID,
    monkeypatch: Any
):
    mock_provider = MockAIProvider([{"task": "Do this"}])
    monkeypatch.setattr(ExtractionService, "_get_default_provider", lambda self: mock_provider)
    
    # First extraction
    await async_client.post(f"/api/v1/meetings/{setup_meeting}/extract", headers=normal_user_token_headers)
    
    # Second extraction
    response2 = await async_client.post(
        f"/api/v1/meetings/{setup_meeting}/extract",
        headers=normal_user_token_headers
    )
    assert response2.status_code == status.HTTP_400_BAD_REQUEST
    assert "already extracted" in response2.json()["detail"].lower()

@pytest.mark.asyncio
async def test_extract_meeting_not_found(
    async_client: AsyncClient, 
    normal_user_token_headers: dict[str, str], 
):
    response = await async_client.post(
        f"/api/v1/meetings/{uuid.uuid4()}/extract",
        headers=normal_user_token_headers
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.asyncio
async def test_extract_cross_user_isolation(
    async_client: AsyncClient, 
    admin_token_headers: dict[str, str], 
    setup_meeting: uuid.UUID,
):
    # admin tries to extract normal_user's meeting
    response = await async_client.post(
        f"/api/v1/meetings/{setup_meeting}/extract",
        headers=admin_token_headers
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.asyncio
async def test_extract_unauthenticated(
    async_client: AsyncClient, 
    setup_meeting: uuid.UUID,
):
    response = await async_client.post(
        f"/api/v1/meetings/{setup_meeting}/extract"
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.asyncio
async def test_extract_missing_transcript(
    async_client: AsyncClient, 
    normal_user_token_headers: dict[str, str], 
    db_session: AsyncSession,
):
    # Create meeting without transcript
    import jwt
    from app.core.config import settings
    token = normal_user_token_headers["Authorization"].replace("Bearer ", "")
    payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    user_id = payload.get("sub")
    
    meeting = Meeting(
        user_id=uuid.UUID(user_id),
        title="No Transcript Meeting",
        processing_status=ProcessingStatus.COMPLETED
    )
    db_session.add(meeting)
    await db_session.commit()
    
    response = await async_client.post(
        f"/api/v1/meetings/{meeting.id}/extract",
        headers=normal_user_token_headers
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "No transcript available" in response.json()["detail"]
    
    await db_session.execute(Meeting.__table__.delete().where(Meeting.id == meeting.id))
    await db_session.commit()

@pytest.mark.asyncio
async def test_extract_schema_validation_failure(
    async_client: AsyncClient, 
    normal_user_token_headers: dict[str, str], 
    setup_meeting: uuid.UUID,
    monkeypatch: Any
):
    from pydantic import ValidationError
    
    class SchemaFailingProvider(AIProvider):
        async def extract_action_items(self, transcript_text: str) -> ExtractionResult:
            # Simulate a validation error from AI provider
            raise ValueError("Schema validation failed: confidence must be <= 1.0")
            
    monkeypatch.setattr(ExtractionService, "_get_default_provider", lambda self: SchemaFailingProvider())
    
    response = await async_client.post(
        f"/api/v1/meetings/{setup_meeting}/extract",
        headers=normal_user_token_headers
    )
    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    
@pytest.mark.asyncio
async def test_extract_persistence_rollback(
    async_client: AsyncClient, 
    normal_user_token_headers: dict[str, str], 
    db_session: AsyncSession,
    setup_meeting: uuid.UUID,
    monkeypatch: Any
):
    mock_provider = MockAIProvider([{"task": "Do this"}])
    monkeypatch.setattr(ExtractionService, "_get_default_provider", lambda self: mock_provider)
    
    # Monkeypatch AsyncSession.add to raise an exception during persistence
    from sqlalchemy.ext.asyncio import AsyncSession
    original_add = AsyncSession.add
    def failing_add(self, instance, *args, **kwargs):
        if isinstance(instance, ActionItem):
            raise Exception("Database persistence error")
        return original_add(self, instance, *args, **kwargs)
        
    monkeypatch.setattr(AsyncSession, "add", failing_add)
    
    response = await async_client.post(
        f"/api/v1/meetings/{setup_meeting}/extract",
        headers=normal_user_token_headers
    )
    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    
    # DB state should be FAILED, rollback should have happened
    db_session.expire_all()
    meeting = (await db_session.execute(select(Meeting).where(Meeting.id == setup_meeting))).scalar_one()
    assert meeting.processing_status == ProcessingStatus.FAILED
    actions = (await db_session.execute(select(ActionItem).where(ActionItem.meeting_id == setup_meeting))).scalars().all()
    assert len(actions) == 0
