import asyncio
import uuid
import datetime
from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.models.meeting import Meeting, ProcessingStatus
from app.models.transcript import Transcript
from app.models.action_item import ActionItem
from app.services.extraction import ExtractionService
from app.services.review import ReviewService
from app.core.security import get_password_hash

async def run_verification():
    async with AsyncSessionLocal() as db:
        # Create user
        user = User(
            email=f"test_verify_{uuid.uuid4()}@example.com",
            hashed_password=get_password_hash("password123"),
            full_name="Test Verify User",
            is_active=True
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        # Set meeting date to a known reference, e.g., Monday Sept 21 2026
        reference_date = datetime.datetime(2026, 9, 21, 10, 0, 0, tzinfo=datetime.timezone.utc)
        
        meeting = Meeting(
            user_id=user.id,
            title="Team Planning Meeting",
            processing_status=ProcessingStatus.COMPLETED,
            meeting_date=reference_date,
            source_type="TXT"
        )
        db.add(meeting)
        await db.commit()
        await db.refresh(meeting)

        transcript_text = """
Team Planning Meeting

Tanmay: We need to finish the project documentation by Friday.
Rahul: I will prepare the API documentation by Wednesday.
Tanmay: Great. I will review the documentation on Thursday.
Priya: I'll prepare the frontend screenshots by Friday.
Everyone agreed that the final project review will happen next Monday.
        """
        
        transcript = Transcript(
            meeting_id=meeting.id,
            raw_text=transcript_text,
            normalized_text=transcript_text
        )
        db.add(transcript)
        await db.commit()

        # Run extraction
        print(f"Running extraction for meeting {meeting.id}...")
        service = ExtractionService()
        result = await service.extract_meeting_actions(db, meeting.id, user.id)
        print("Extraction Result:", result)

        # Inspect extracted deadlines
        actions = (await db.execute(
            select(ActionItem).where(ActionItem.meeting_id == meeting.id)
        )).scalars().all()
        
        print("\n=== EXTRACTED DEADLINES ===")
        for a in actions:
            print(f"Task: {a.task}")
            print(f"Owner: {a.owner_name}")
            print(f"Deadline: {a.deadline}")
            print(f"Validation Status: {a.validation_status}")
            print(f"Review Status: {a.review_status}")
            print(f"Review Reasons: {a.review_reasons}")
            print("---")

        # Inspect Review Queue
        print("\n=== REVIEW QUEUE ===")
        review_service = ReviewService()
        queue = await review_service.get_needs_review_items(db, user.id)
        print(f"Found {len(queue)} items in review queue.")
        for item in queue:
            print(f"Queue ID: {item.id}, Task: {item.task}, Reason: {item.review_reasons}")

if __name__ == "__main__":
    asyncio.run(run_verification())
