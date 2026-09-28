import uuid
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select, func, and_
from app.models.meeting import Meeting, ProcessingStatus
from app.models.evaluation import EvaluationRun, EvaluationRunStatus

async def acquire_user_advisory_lock(db: AsyncSession, user_id: uuid.UUID) -> None:
    """
    Acquires a transaction-level advisory lock for the user.
    The lock is automatically released at the end of the transaction.
    If the lock cannot be acquired immediately, it throws a 429 error to prevent waiting under heavy concurrency.
    """
    # Hash the uuid to a 64-bit integer
    lock_id = user_id.int & ((1 << 63) - 1)
    
    # pg_try_advisory_xact_lock acquires a transaction-level lock without waiting.
    # It returns true if successful, false if the lock is already held.
    result = await db.execute(text("SELECT pg_try_advisory_xact_lock(:lock_id)"), {"lock_id": lock_id})
    acquired = result.scalar()
    
    if not acquired:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="You have concurrent requests processing. Please try again in a moment."
        )

async def enforce_meeting_concurrency_limit(db: AsyncSession, user_id: uuid.UUID, limit: int = 3) -> None:
    """
    Enforces that a user cannot have more than `limit` meetings in PROCESSING or EXTRACTING states.
    MUST be called within a transaction AFTER acquiring the advisory lock.
    """
    query = select(func.count(Meeting.id)).where(
        and_(
            Meeting.user_id == user_id,
            Meeting.processing_status.in_([ProcessingStatus.PROCESSING, ProcessingStatus.EXTRACTING])
        )
    )
    result = await db.execute(query)
    count = result.scalar() or 0
    
    if count >= limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"You already have {count} active processing jobs. Please wait for them to finish."
        )

async def enforce_evaluation_concurrency_limit(db: AsyncSession, user_id: uuid.UUID, limit: int = 3) -> None:
    """
    Enforces that a user cannot have more than `limit` evaluation runs in PENDING or RUNNING states.
    MUST be called within a transaction AFTER acquiring the advisory lock.
    """
    query = select(func.count(EvaluationRun.id)).where(
        and_(
            EvaluationRun.user_id == user_id,
            EvaluationRun.status.in_([EvaluationRunStatus.PENDING, EvaluationRunStatus.RUNNING])
        )
    )
    result = await db.execute(query)
    count = result.scalar() or 0
    
    if count >= limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"You already have {count} active evaluation runs. Please wait for them to finish."
        )
