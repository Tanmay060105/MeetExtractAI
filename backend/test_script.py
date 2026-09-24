import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.models import User, Meeting, Participant, ActionItem, Review, ActionStatus, ValidationStatus, ReviewStatus, ProcessingStatus, ReviewDecision

async def run_test():
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    Session = async_sessionmaker(engine, expire_on_commit=False)
    
    async with Session() as db_session:
        print("Inserting data...")
        user = User(email="script@example.com", full_name="Null User")
        db_session.add(user)
        await db_session.flush()
        
        reviewer = User(email="reviewer@example.com", full_name="Reviewer")
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
        
        print("Data committed. Testing Participant -> ActionItem.owner_id (SET NULL)...")
        await db_session.delete(participant)
        await db_session.commit()
        
        print("Participant deleted. Fetching action item...")
        ai = await db_session.get(ActionItem, action_item.id)
        print("ActionItem owner_id:", ai.owner_id)
        
        print("Testing User -> Review.reviewer_id (SET NULL)...")
        await db_session.delete(reviewer)
        await db_session.commit()
        
        print("User deleted. Fetching review...")
        rev = await db_session.get(Review, review.id)
        print("Review reviewer_id:", rev.reviewer_id)

if __name__ == "__main__":
    asyncio.run(run_test())
