import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import status
import uuid
from datetime import datetime, timedelta, timezone

from app.models.meeting import Meeting, ProcessingStatus
from app.models.transcript import Transcript
from app.models.action_item import ActionItem, ValidationStatus, ReviewStatus, ActionStatus
from app.models.participant import Participant
from app.services.validation import ValidationService
import jwt
from app.core.config import settings

@pytest_asyncio.fixture
async def validation_setup(db_session: AsyncSession, normal_user_token_headers):
    # Retrieve user from DB using token
    from app.models.user import User
    token = normal_user_token_headers["Authorization"].split(" ")[1]
    payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    user = (await db_session.execute(select(User).where(User.id == uuid.UUID(payload["sub"])))).scalars().first()
    
    meeting = Meeting(user_id=user.id, title="Validation Test Meeting", processing_status=ProcessingStatus.COMPLETED)
    db_session.add(meeting)
    await db_session.commit()
    
    transcript = Transcript(
        meeting_id=meeting.id, 
        raw_text="John said he will send the report by tomorrow. Alice agreed to review it.",
        normalized_text="john said he will send the report by tomorrow. alice agreed to review it."
    )
    db_session.add(transcript)
    
    participant1 = Participant(meeting_id=meeting.id, name="John Doe")
    participant2 = Participant(meeting_id=meeting.id, name="Alice Smith")
    participant3 = Participant(meeting_id=meeting.id, name="Alice Jones") # to test ambiguity if we match "Alice"
    
    db_session.add_all([participant1, participant2, participant3])
    await db_session.commit()
    
    return {
        "meeting": meeting,
        "transcript": transcript,
        "headers": normal_user_token_headers
    }

@pytest.mark.asyncio
async def test_validate_action_items_endpoint(async_client: AsyncClient, db_session: AsyncSession, validation_setup):
    meeting = validation_setup["meeting"]
    headers = validation_setup["headers"]
    
    # Insert some action items
    action1 = ActionItem(
        meeting_id=meeting.id,
        task="Send the report",
        owner_name="John Doe", # valid owner
        deadline=datetime.now(timezone.utc) + timedelta(days=1), # valid deadline
        status=ActionStatus.PENDING,
        evidence="John said he will send the report by tomorrow.", # valid evidence
        confidence=0.95,
        validation_status=ValidationStatus.UNKNOWN,
        review_status=ReviewStatus.READY
    )
    
    action2 = ActionItem(
        meeting_id=meeting.id,
        task="Review the report",
        owner_name="Bob", # invalid owner
        deadline=None, # missing deadline
        status=ActionStatus.PENDING,
        evidence="Alice agreed to review it.", # evidence doesn't conflict, wait, does it? "Alice agreed to review it." has "alice agreed to review it." in transcript text.
        confidence=0.6, # low confidence
        validation_status=ValidationStatus.UNKNOWN,
        review_status=ReviewStatus.READY
    )
    
    action3 = ActionItem(
        meeting_id=meeting.id,
        task="Send the report", # duplicate of action1
        owner_name="John", # valid partial owner
        deadline=action1.deadline,
        status=ActionStatus.PENDING,
        evidence="John said he will send the report by tomorrow.",
        confidence=0.9,
        validation_status=ValidationStatus.UNKNOWN,
        review_status=ReviewStatus.READY
    )
    
    action4 = ActionItem(
        meeting_id=meeting.id,
        task="Do something else",
        owner_name=None, # missing owner
        deadline=None,
        status=ActionStatus.PENDING,
        evidence="This is totally fabricated.", # evidence conflict (missing in transcript)
        confidence=0.8,
        validation_status=ValidationStatus.UNKNOWN,
        review_status=ReviewStatus.READY
    )
    
    db_session.add_all([action1, action2, action3, action4])
    await db_session.commit()
    
    # Call validation endpoint
    response = await async_client.post(f"/api/v1/meetings/{meeting.id}/validate", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    summary = response.json()
    
    assert summary["total"] == 4
    assert summary["duplicates"] >= 1
    
    # Ensure test session sees the updated rows from the API transaction without triggering refresh lazy-loads
    db_session.expunge_all()
    
    # Verify in DB
    result = await db_session.execute(select(ActionItem).where(ActionItem.meeting_id == meeting.id).order_by(ActionItem.created_at))
    actions = result.scalars().all()
    
    # Action 1 (Valid)
    a1 = next(a for a in actions if a.id == action1.id)
    assert a1.validation_status == ValidationStatus.VALID
    assert a1.review_status == ReviewStatus.READY
    assert a1.review_reasons is None
    
    # Action 2 (Invalid owner, low conf)
    a2 = next(a for a in actions if a.id == action2.id)
    assert a2.review_status == ReviewStatus.NEEDS_REVIEW
    assert "INVALID_OWNER" in a2.review_reasons
    assert "LOW_CONFIDENCE" in a2.review_reasons
    assert a2.validation_status == ValidationStatus.INVALID
    
    # Action 3 (Duplicate, valid partial owner)
    a3 = next(a for a in actions if a.id == action3.id)
    assert a3.review_status == ReviewStatus.NEEDS_REVIEW
    assert "DUPLICATE_ACTION" in a3.review_reasons
    # owner "John" matches "John Doe" in our deterministic partial match
    assert a3.owner_id is not None 
    
    # Action 4 (Missing owner, Evidence conflict)
    a4 = next(a for a in actions if a.id == action4.id)
    assert a4.review_status == ReviewStatus.NEEDS_REVIEW
    assert "MISSING_OWNER" in a4.review_reasons
    assert "EVIDENCE_CONFLICT" in a4.review_reasons
    assert a4.validation_status == ValidationStatus.INVALID

@pytest.mark.asyncio
async def test_validation_unauthenticated(async_client: AsyncClient):
    response = await async_client.post(f"/api/v1/meetings/{uuid.uuid4()}/validate")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.asyncio
async def test_validation_foreign_meeting(async_client: AsyncClient, admin_token_headers, validation_setup):
    meeting = validation_setup["meeting"]
    # Admin tries to validate normal user's meeting
    response = await async_client.post(f"/api/v1/meetings/{meeting.id}/validate", headers=admin_token_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.asyncio
async def test_validation_empty_actions(async_client: AsyncClient, validation_setup):
    meeting = validation_setup["meeting"]
    headers = validation_setup["headers"]
    response = await async_client.post(f"/api/v1/meetings/{meeting.id}/validate", headers=headers)
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.asyncio
async def test_validate_action_items_no_participants(async_client: AsyncClient, db_session: AsyncSession, validation_setup):
    # Setup meeting with NO participants
    meeting = validation_setup["meeting"]
    headers = validation_setup["headers"]
    
    # Delete the participants from setup
    await db_session.execute(Participant.__table__.delete().where(Participant.meeting_id == meeting.id))
    await db_session.commit()
    
    # Insert an action item with an owner
    action = ActionItem(
        meeting_id=meeting.id,
        task="Prepare the slides",
        owner_name="David", # Owner has no participant records to check against
        deadline=datetime.now(timezone.utc) + timedelta(days=1),
        status=ActionStatus.PENDING,
        evidence="John said he will send the report by tomorrow.",
        confidence=0.9,
        validation_status=ValidationStatus.UNKNOWN,
        review_status=ReviewStatus.READY
    )
    
    db_session.add(action)
    await db_session.commit()
    
    # Call validation endpoint
    response = await async_client.post(f"/api/v1/meetings/{meeting.id}/validate", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    
    db_session.expunge_all()
    
    # Verify in DB
    result = await db_session.execute(select(ActionItem).where(ActionItem.meeting_id == meeting.id))
    validated_action = result.scalars().first()
    
    assert validated_action.validation_status == ValidationStatus.UNKNOWN
    assert validated_action.review_status == ReviewStatus.NEEDS_REVIEW
    assert "UNVERIFIED_OWNER" in validated_action.review_reasons
