import uuid
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.models.meeting import Meeting, ProcessingStatus
from app.models.transcript import Transcript
from app.models.action_item import ActionItem, ValidationStatus, ReviewStatus
from app.services.ai.base import AIProvider
from app.services.ai.openai_provider import OpenAIProvider
from app.services.ai.gemini_provider import GeminiProvider
from app.core.config import settings

import logging
logger = logging.getLogger(__name__)

class ExtractionService:
    def __init__(self, provider: Optional[AIProvider] = None):
        self.provider = provider or self._get_default_provider()

    def _get_default_provider(self) -> AIProvider:
        provider_name = settings.AI_PROVIDER.lower() if settings.AI_PROVIDER else "openai"
        if provider_name == "gemini":
            return GeminiProvider()
        elif provider_name == "openai":
            return OpenAIProvider()
        else:
            # Fallback to openai if empty or unspecified in current setup
            return OpenAIProvider()

    async def extract_meeting_actions(self, db: AsyncSession, meeting_id: uuid.UUID, user_id: uuid.UUID) -> dict:
        """
        Trigger extraction for a specific meeting.
        """
        # Verify meeting belongs to user
        result = await db.execute(select(Meeting).where(Meeting.id == meeting_id, Meeting.user_id == user_id))
        meeting = result.scalar_one_or_none()
        
        if not meeting:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")

        # Check for existing action items to prevent duplicate extraction
        actions_result = await db.execute(select(ActionItem).where(ActionItem.meeting_id == meeting_id))
        if actions_result.scalars().first() is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Action items already extracted for this meeting"
            )

        # Get transcript
        transcript_result = await db.execute(select(Transcript).where(Transcript.meeting_id == meeting_id))
        transcript = transcript_result.scalar_one_or_none()
        if not transcript or not transcript.normalized_text:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No transcript available for extraction")

        try:
            # Set state to EXTRACTING
            meeting.processing_status = ProcessingStatus.EXTRACTING
            await db.commit()
            
            # Execute AI extraction
            reference_date = meeting.meeting_date if meeting.meeting_date else meeting.created_at
            extraction_result = await self.provider.extract_action_items(
                transcript.normalized_text,
                reference_date=reference_date
            )
            
            # Persist actions
            action_items = []
            for action_data in extraction_result.actions:
                new_action = ActionItem(
                    meeting_id=meeting.id,
                    task=action_data.task,
                    owner_name=action_data.owner_name,
                    deadline=action_data.deadline,
                    status=action_data.status,
                    confidence=action_data.confidence,
                    evidence=action_data.evidence,
                    source_location=action_data.source_location,
                    validation_status=ValidationStatus.UNKNOWN,
                    review_status=ReviewStatus.READY
                )
                db.add(new_action)
                action_items.append(new_action)
                
            # Update state to EXTRACTING (wait, already done above)
            # We already persisted actions, now let's flush them to give them IDs
            await db.flush()
            
            # Update state to VALIDATING
            meeting.processing_status = ProcessingStatus.VALIDATING
            await db.commit()
            
            # Run validation
            from app.services.validation import ValidationService
            validation_service = ValidationService()
            summary = await validation_service.validate_action_items(db, meeting.id, action_items)
            
            # Update state to COMPLETED
            meeting.processing_status = ProcessingStatus.COMPLETED
            await db.commit()
            
            return {
                "meeting_id": meeting.id,
                "processing_status": meeting.processing_status,
                "extracted_count": len(action_items),
                "validation_summary": summary
            }
            
        except Exception as e:
            await db.rollback()
            # Set state to FAILED
            # Note: We must re-fetch meeting or just execute an update query because 
            # the rollback detached or expired the meeting object.
            await db.execute(
                Meeting.__table__.update()
                .where(Meeting.id == meeting_id)
                .values(processing_status=ProcessingStatus.FAILED)
            )
            await db.commit()
            logger.error(f"Extraction failed for meeting {meeting_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Extraction failed: {str(e)}"
            )
