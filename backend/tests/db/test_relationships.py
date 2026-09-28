import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select
from sqlalchemy.pool import NullPool
from app.core.config import settings
from app.models import (
    User, Meeting, Participant, ActionItem, Review, Transcript,
    EvaluationDataset, EvaluationSample, EvaluationRun, EvaluationResult,
    ActionStatus, ValidationStatus, ReviewStatus, ProcessingStatus, ReviewDecision, EvaluationRunStatus
)

# Fixtures are now in conftest.py

@pytest.mark.asyncio
async def test_cascades(db_session: AsyncSession):
    import uuid
    user = User(email=f"cascade_{uuid.uuid4()}@example.com", full_name="Cascade User", hashed_password="foo")
    db_session.add(user)
    await db_session.flush()

    meeting = Meeting(user_id=user.id, title="Test", processing_status=ProcessingStatus.COMPLETED)
    db_session.add(meeting)
    await db_session.flush()
    
    transcript = Transcript(meeting_id=meeting.id, raw_text="text")
    db_session.add(transcript)
    
    participant = Participant(meeting_id=meeting.id, name="Part 1")
    db_session.add(participant)
    await db_session.flush()
    
    action_item = ActionItem(
        meeting_id=meeting.id, task="task", owner_id=participant.id,
        status=ActionStatus.PENDING, validation_status=ValidationStatus.VALID,
        review_status=ReviewStatus.READY
    )
    db_session.add(action_item)
    await db_session.flush()

    review = Review(
        action_item_id=action_item.id, reviewer_id=user.id,
        decision=ReviewDecision.APPROVED
    )
    db_session.add(review)
    
    dataset = EvaluationDataset(name="DS", version="1", user_id=user.id)
    db_session.add(dataset)
    await db_session.flush()
    
    sample = EvaluationSample(dataset_id=dataset.id, transcript="T", ground_truth={})
    db_session.add(sample)
    
    run = EvaluationRun(dataset_id=dataset.id, user_id=user.id, model_version="1", prompt_version="1", status=EvaluationRunStatus.COMPLETED)
    db_session.add(run)
    await db_session.flush()
    
    result = EvaluationResult(run_id=run.id, sample_id=sample.id, ground_truth={})
    db_session.add(result)
    
    await db_session.commit()

    # Test ActionItem -> Review Cascade
    await db_session.delete(action_item)
    await db_session.commit()
    assert (await db_session.scalar(select(Review).where(Review.id == review.id))) is None

    # Test Meeting -> Transcript, Participant (ActionItem is already deleted)
    await db_session.delete(meeting)
    await db_session.commit()
    assert (await db_session.scalar(select(Transcript).where(Transcript.id == transcript.id))) is None
    assert (await db_session.scalar(select(Participant).where(Participant.id == participant.id))) is None
    
    # User -> Meeting Cascade (Let's create a new meeting to test it)
    meeting2 = Meeting(user_id=user.id, title="M2", processing_status=ProcessingStatus.COMPLETED)
    db_session.add(meeting2)
    await db_session.commit()
    await db_session.delete(user)
    await db_session.commit()
    assert (await db_session.scalar(select(Meeting).where(Meeting.id == meeting2.id))) is None

    # Evaluation Cascades
    await db_session.delete(dataset)
    await db_session.commit()
    assert (await db_session.scalar(select(EvaluationSample).where(EvaluationSample.id == sample.id))) is None
    assert (await db_session.scalar(select(EvaluationRun).where(EvaluationRun.id == run.id))) is None
    assert (await db_session.scalar(select(EvaluationResult).where(EvaluationResult.id == result.id))) is None


@pytest.mark.asyncio
async def test_set_null_behaviors(db_session: AsyncSession):
    import uuid
    user = User(email=f"setnull_{uuid.uuid4()}@example.com", full_name="Null User", hashed_password="foo")
    db_session.add(user)
    await db_session.flush()
    
    reviewer = User(email=f"reviewer_{uuid.uuid4()}@example.com", full_name="Reviewer", hashed_password="foo")
    db_session.add(reviewer)
    await db_session.flush()
    
    meeting = Meeting(user_id=user.id, title="Test", processing_status=ProcessingStatus.COMPLETED)
    db_session.add(meeting)
    await db_session.flush()
    
    participant = Participant(meeting_id=meeting.id, name="Part")
    db_session.add(participant)
    await db_session.flush()
    
    action_item = ActionItem(
        meeting_id=meeting.id, task="task", owner_id=participant.id,
        status=ActionStatus.PENDING, validation_status=ValidationStatus.VALID,
        review_status=ReviewStatus.READY
    )
    db_session.add(action_item)
    await db_session.flush()

    review = Review(
        action_item_id=action_item.id, reviewer_id=reviewer.id,
        decision=ReviewDecision.APPROVED
    )
    db_session.add(review)
    await db_session.commit()
    
    # 1. Test Participant -> ActionItem.owner_id (SET NULL)
    await db_session.delete(participant)
    await db_session.commit()
    
    ai = await db_session.get(ActionItem, action_item.id)
    await db_session.refresh(ai)
    assert ai is not None
    assert ai.owner_id is None
    
    # 2. Test User -> Review.reviewer_id (SET NULL)
    await db_session.delete(reviewer)
    await db_session.commit()
    
    rev = await db_session.get(Review, review.id)
    await db_session.refresh(rev)
    assert rev is not None
    assert rev.reviewer_id is None
