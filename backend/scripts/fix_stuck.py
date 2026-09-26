import asyncio
import uuid
from app.db.session import AsyncSessionLocal
from app.services.extraction import ExtractionService
from sqlalchemy import text

async def run_extraction():
    meeting_id = uuid.UUID('58642324-fa5d-40f8-83d7-d2fcc622587b')
    async with AsyncSessionLocal() as session:
        result = await session.execute(text(f"SELECT user_id FROM meetings WHERE id = '{meeting_id}'"))
        user_id = result.scalar()
        if not user_id:
            print('Meeting not found')
            return
            
        print(f'Starting extraction for user {user_id}')
        extraction_service = ExtractionService()
        await extraction_service.extract_meeting_actions(db=session, meeting_id=meeting_id, user_id=user_id)
        print('Extraction complete!')
        
async def mark_failed():
    async with AsyncSessionLocal() as session:
        await session.execute(text("UPDATE meetings SET processing_status = 'FAILED' WHERE processing_status = 'PROCESSING'"))
        await session.commit()
        print("Updated stuck meetings to FAILED")

asyncio.run(run_extraction())
