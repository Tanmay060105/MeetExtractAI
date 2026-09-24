import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from fastapi import HTTPException, status

from app.models.meeting import Meeting
from app.models.action_item import ActionItem, ReviewStatus
from app.models.review import Review, ReviewDecision
from app.models.transcript import Transcript
from app.schemas.review import ReviewCreate, ReviewQueueItem, ReviewDetailResponse

class ReviewService:
    async def get_needs_review_items(self, db: AsyncSession, user_id: uuid.UUID) -> List[ReviewQueueItem]:
        query = (
            select(ActionItem, Meeting.title)
            .join(Meeting, ActionItem.meeting_id == Meeting.id)
            .where(
                and_(
                    Meeting.user_id == user_id,
                    ActionItem.review_status == ReviewStatus.NEEDS_REVIEW
                )
            )
            .order_by(ActionItem.created_at.desc())
        )
        
        result = await db.execute(query)
        items = result.all()
        
        queue = []
        for action_item, meeting_title in items:
            queue.append(
                ReviewQueueItem(
                    id=action_item.id,
                    meeting_id=action_item.meeting_id,
                    meeting_title=meeting_title,
                    task=action_item.task,
                    owner_name=action_item.owner_name,
                    deadline=action_item.deadline,
                    status=action_item.status,
                    confidence=action_item.confidence,
                    evidence=action_item.evidence,
                    validation_status=action_item.validation_status,
                    review_status=action_item.review_status,
                    review_reasons=action_item.review_reasons,
                    created_at=action_item.created_at,
                    updated_at=action_item.updated_at
                )
            )
            
        return queue
        
    async def get_review_details(self, db: AsyncSession, user_id: uuid.UUID, action_item_id: uuid.UUID) -> ReviewDetailResponse:
        # Load action item and ensure ownership
        query = (
            select(ActionItem, Meeting.title)
            .join(Meeting, ActionItem.meeting_id == Meeting.id)
            .where(
                and_(
                    ActionItem.id == action_item_id,
                    Meeting.user_id == user_id
                )
            )
        )
        
        result = await db.execute(query)
        row = result.first()
        
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action item not found")
            
        action_item, meeting_title = row
        
        # Load transcript context
        transcript_query = select(Transcript).where(Transcript.meeting_id == action_item.meeting_id)
        transcript_result = await db.execute(transcript_query)
        transcript = transcript_result.scalar_one_or_none()
        
        # Load past reviews
        reviews_query = select(Review).where(Review.action_item_id == action_item_id).order_by(Review.created_at.desc())
        reviews_result = await db.execute(reviews_query)
        reviews = list(reviews_result.scalars().all())
        
        queue_item = ReviewQueueItem(
            id=action_item.id,
            meeting_id=action_item.meeting_id,
            meeting_title=meeting_title,
            task=action_item.task,
            owner_name=action_item.owner_name,
            deadline=action_item.deadline,
            status=action_item.status,
            confidence=action_item.confidence,
            evidence=action_item.evidence,
            validation_status=action_item.validation_status,
            review_status=action_item.review_status,
            review_reasons=action_item.review_reasons,
            created_at=action_item.created_at,
            updated_at=action_item.updated_at
        )
        
        # Simply return transcript context as raw text if it exists (not duplicating perfectly, just available text)
        transcript_context = transcript.raw_text if transcript else None
        
        return ReviewDetailResponse(
            action_item=queue_item,
            transcript_context=transcript_context,
            reviews=reviews
        )
        
    async def submit_review_decision(
        self, db: AsyncSession, user_id: uuid.UUID, action_item_id: uuid.UUID, review_data: ReviewCreate
    ) -> ReviewQueueItem:
        # Validate ownership and retrieve action item
        query = (
            select(ActionItem, Meeting.title)
            .join(Meeting, ActionItem.meeting_id == Meeting.id)
            .where(
                and_(
                    ActionItem.id == action_item_id,
                    Meeting.user_id == user_id
                )
            )
        )
        
        result = await db.execute(query)
        row = result.first()
        
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action item not found")
            
        action_item, meeting_title = row
        
        # Create review record
        previous_value = None
        new_value = None
        
        if review_data.decision == ReviewDecision.APPROVED:
            action_item.review_status = ReviewStatus.REVIEWED
            
        elif review_data.decision == ReviewDecision.EDITED_AND_APPROVED:
            if not review_data.edits:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, 
                    detail="Edits must be provided for EDITED_AND_APPROVED decision"
                )
                
            previous_value = {
                "task": action_item.task,
                "owner_name": action_item.owner_name,
                "deadline": action_item.deadline.isoformat() if action_item.deadline else None,
                "status": action_item.status
            }
            new_value = {}
            
            if review_data.edits.task is not None:
                action_item.task = review_data.edits.task
                new_value["task"] = review_data.edits.task
            if review_data.edits.owner_name is not None:
                action_item.owner_name = review_data.edits.owner_name
                new_value["owner_name"] = review_data.edits.owner_name
            if review_data.edits.deadline is not None:
                action_item.deadline = review_data.edits.deadline
                new_value["deadline"] = review_data.edits.deadline.isoformat()
            if review_data.edits.status is not None:
                action_item.status = review_data.edits.status
                new_value["status"] = review_data.edits.status
                
            action_item.review_status = ReviewStatus.REVIEWED
            
        elif review_data.decision == ReviewDecision.REJECTED:
            action_item.review_status = ReviewStatus.REJECTED
            
        review_record = Review(
            action_item_id=action_item.id,
            reviewer_id=user_id,
            decision=review_data.decision,
            notes=review_data.notes,
            previous_value=previous_value,
            new_value=new_value
        )
        
        db.add(review_record)
        db.add(action_item)
        await db.commit()
        await db.refresh(action_item)
        
        return ReviewQueueItem(
            id=action_item.id,
            meeting_id=action_item.meeting_id,
            meeting_title=meeting_title,
            task=action_item.task,
            owner_name=action_item.owner_name,
            deadline=action_item.deadline,
            status=action_item.status,
            confidence=action_item.confidence,
            evidence=action_item.evidence,
            validation_status=action_item.validation_status,
            review_status=action_item.review_status,
            review_reasons=action_item.review_reasons,
            created_at=action_item.created_at,
            updated_at=action_item.updated_at
        )
