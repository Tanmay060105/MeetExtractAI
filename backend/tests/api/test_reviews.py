import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import status
import uuid

from app.models.meeting import Meeting, ProcessingStatus
from app.models.transcript import Transcript
from app.models.action_item import ActionItem, ValidationStatus, ReviewStatus, ActionStatus
from app.models.review import Review, ReviewDecision
import jwt
from app.core.config import settings

@pytest_asyncio.fixture
async def review_setup(db_session: AsyncSession, normal_user_token_headers):
    # Retrieve user from DB using token
    from app.models.user import User
    token = normal_user_token_headers["Authorization"].split(" ")[1]
    payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    user = (await db_session.execute(select(User).where(User.id == uuid.UUID(payload["sub"])))).scalars().first()
    
    meeting = Meeting(user_id=user.id, title="Review Test Meeting", processing_status=ProcessingStatus.COMPLETED)
    db_session.add(meeting)
    await db_session.commit()
    
    transcript = Transcript(
        meeting_id=meeting.id, 
        raw_text="Test transcript",
        normalized_text="test transcript"
    )
    db_session.add(transcript)
    await db_session.commit()
    
    # Action item requiring review
    action1 = ActionItem(
        meeting_id=meeting.id,
        task="Task needing review",
        owner_name=None,
        status=ActionStatus.PENDING,
        validation_status=ValidationStatus.INVALID,
        review_status=ReviewStatus.NEEDS_REVIEW,
        review_reasons=["MISSING_OWNER"]
    )
    
    # Action item already reviewed
    action2 = ActionItem(
        meeting_id=meeting.id,
        task="Task already reviewed",
        owner_name="Valid Owner",
        status=ActionStatus.PENDING,
        validation_status=ValidationStatus.VALID,
        review_status=ReviewStatus.REVIEWED
    )
    
    db_session.add_all([action1, action2])
    await db_session.commit()
    await db_session.refresh(action1)
    await db_session.refresh(action2)
    
    return {
        "meeting": meeting,
        "transcript": transcript,
        "action_needs_review": action1,
        "action_reviewed": action2,
        "headers": normal_user_token_headers,
        "user_id": user.id
    }

@pytest.mark.asyncio
async def test_get_pending_reviews(async_client: AsyncClient, review_setup):
    headers = review_setup["headers"]
    action = review_setup["action_needs_review"]
    
    response = await async_client.get("/api/v1/reviews/pending", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    assert len(data) == 1
    assert data[0]["id"] == str(action.id)
    assert data[0]["task"] == "Task needing review"

@pytest.mark.asyncio
async def test_get_review_details(async_client: AsyncClient, review_setup):
    headers = review_setup["headers"]
    action = review_setup["action_needs_review"]
    
    response = await async_client.get(f"/api/v1/reviews/{action.id}", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    assert data["action_item"]["id"] == str(action.id)
    assert data["transcript_context"] == "Test transcript"
    assert len(data["reviews"]) == 0

@pytest.mark.asyncio
async def test_submit_approved(async_client: AsyncClient, db_session: AsyncSession, review_setup):
    headers = review_setup["headers"]
    action = review_setup["action_needs_review"]
    
    payload = {
        "decision": "APPROVED",
        "notes": "Looks good despite missing owner"
    }
    
    response = await async_client.post(f"/api/v1/reviews/{action.id}", json=payload, headers=headers)
    assert response.status_code == status.HTTP_200_OK
    
    db_session.expunge_all()
    
    result = await db_session.execute(select(ActionItem).where(ActionItem.id == action.id))
    updated_action = result.scalars().first()
    assert updated_action.review_status == ReviewStatus.REVIEWED
    
    result = await db_session.execute(select(Review).where(Review.action_item_id == action.id))
    review_record = result.scalars().first()
    assert review_record is not None
    assert review_record.decision == ReviewDecision.APPROVED
    assert review_record.notes == "Looks good despite missing owner"
    assert review_record.reviewer_id == review_setup["user_id"]

@pytest.mark.asyncio
async def test_submit_edited_and_approved(async_client: AsyncClient, db_session: AsyncSession, review_setup):
    headers = review_setup["headers"]
    action = review_setup["action_needs_review"]
    
    payload = {
        "decision": "EDITED_AND_APPROVED",
        "notes": "Added missing owner",
        "edits": {
            "owner_name": "New Owner",
            "task": "Updated Task"
        }
    }
    
    response = await async_client.post(f"/api/v1/reviews/{action.id}", json=payload, headers=headers)
    assert response.status_code == status.HTTP_200_OK
    
    db_session.expunge_all()
    
    result = await db_session.execute(select(ActionItem).where(ActionItem.id == action.id))
    updated_action = result.scalars().first()
    assert updated_action.review_status == ReviewStatus.REVIEWED
    assert updated_action.owner_name == "New Owner"
    assert updated_action.task == "Updated Task"
    
    result = await db_session.execute(select(Review).where(Review.action_item_id == action.id))
    review_record = result.scalars().first()
    assert review_record is not None
    assert review_record.decision == ReviewDecision.EDITED_AND_APPROVED
    assert review_record.previous_value["owner_name"] is None
    assert review_record.previous_value["task"] == "Task needing review"
    assert review_record.new_value["owner_name"] == "New Owner"
    assert review_record.new_value["task"] == "Updated Task"

@pytest.mark.asyncio
async def test_submit_rejected(async_client: AsyncClient, db_session: AsyncSession, review_setup):
    headers = review_setup["headers"]
    action = review_setup["action_needs_review"]
    
    payload = {
        "decision": "REJECTED",
        "notes": "Not a real action item"
    }
    
    response = await async_client.post(f"/api/v1/reviews/{action.id}", json=payload, headers=headers)
    assert response.status_code == status.HTTP_200_OK
    
    db_session.expunge_all()
    
    result = await db_session.execute(select(ActionItem).where(ActionItem.id == action.id))
    updated_action = result.scalars().first()
    assert updated_action.review_status == ReviewStatus.REJECTED
    
    result = await db_session.execute(select(Review).where(Review.action_item_id == action.id))
    review_record = result.scalars().first()
    assert review_record is not None
    assert review_record.decision == ReviewDecision.REJECTED

@pytest.mark.asyncio
async def test_submit_edited_and_approved_missing_edits(async_client: AsyncClient, review_setup):
    headers = review_setup["headers"]
    action = review_setup["action_needs_review"]
    
    payload = {
        "decision": "EDITED_AND_APPROVED",
        "notes": "Forgot to provide edits"
    }
    
    response = await async_client.post(f"/api/v1/reviews/{action.id}", json=payload, headers=headers)
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.asyncio
async def test_foreign_action_item(async_client: AsyncClient, admin_token_headers, review_setup):
    action = review_setup["action_needs_review"]
    
    # admin_token_headers belongs to a different user
    response = await async_client.get(f"/api/v1/reviews/{action.id}", headers=admin_token_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND
    
    payload = {
        "decision": "APPROVED"
    }
    response = await async_client.post(f"/api/v1/reviews/{action.id}", json=payload, headers=admin_token_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.asyncio
async def test_unauthenticated(async_client: AsyncClient, review_setup):
    action = review_setup["action_needs_review"]
    
    response = await async_client.get("/api/v1/reviews/pending")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    response = await async_client.get(f"/api/v1/reviews/{action.id}")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    payload = {
        "decision": "APPROVED"
    }
    response = await async_client.post(f"/api/v1/reviews/{action.id}", json=payload)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
