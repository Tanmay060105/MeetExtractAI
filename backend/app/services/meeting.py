import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.meeting import Meeting, ProcessingStatus
from app.models.transcript import Transcript
from app.schemas.meeting import MeetingTextCreate
import datetime

async def create_meeting_and_transcript(
    db: AsyncSession,
    user_id: uuid.UUID,
    title: str,
    raw_text: str,
    normalized_text: str,
    meeting_date: datetime.datetime | None = None,
    source_type: str | None = None,
    source_filename: str | None = None,
) -> Meeting:
    """
    Creates a Meeting and its Transcript in a single atomic transaction.
    """
    meeting = Meeting(
        user_id=user_id,
        title=title,
        meeting_date=meeting_date,
        source_type=source_type,
        processing_status=ProcessingStatus.PROCESSING
    )
    db.add(meeting)
    await db.flush() # Flush to get meeting.id for the transcript

    transcript = Transcript(
        meeting_id=meeting.id,
        raw_text=raw_text,
        normalized_text=normalized_text,
        source_filename=source_filename
    )
    db.add(transcript)
    await db.commit()
    await db.refresh(meeting)
    
    return meeting

async def get_user_meetings(db: AsyncSession, user_id: uuid.UUID) -> list[Meeting]:
    result = await db.execute(
        select(Meeting).where(Meeting.user_id == user_id).order_by(Meeting.created_at.desc())
    )
    return list(result.scalars().all())

async def get_user_meeting(db: AsyncSession, user_id: uuid.UUID, meeting_id: uuid.UUID) -> Meeting | None:
    result = await db.execute(
        select(Meeting).where(Meeting.user_id == user_id, Meeting.id == meeting_id)
    )
    return result.scalar_one_or_none()

async def get_user_transcript(db: AsyncSession, user_id: uuid.UUID, meeting_id: uuid.UUID) -> Transcript | None:
    # First verify the user owns the meeting
    meeting = await get_user_meeting(db, user_id, meeting_id)
    if not meeting:
        return None
        
    result = await db.execute(
        select(Transcript).where(Transcript.meeting_id == meeting_id)
    )
    return result.scalar_one_or_none()
