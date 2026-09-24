import uuid
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from fastapi import HTTPException, status

from app.models.action_item import ActionItem
from app.models.meeting import Meeting
from app.models.review import Review
from app.schemas.action_item import ActionItemWithMeeting, ActionItemUpdate

class ActionItemService:
    async def get_user_action_items(self, db: AsyncSession, user_id: uuid.UUID) -> List[ActionItemWithMeeting]:
        query = (
            select(ActionItem, Meeting.title, Review.id)
            .join(Meeting, ActionItem.meeting_id == Meeting.id)
            .outerjoin(Review, Review.action_item_id == ActionItem.id)
            .where(Meeting.user_id == user_id)
            .order_by(ActionItem.created_at.desc(), Review.created_at.desc())
        )
        
        result = await db.execute(query)
        rows = result.all()
        
        # We might get multiple rows per action_item if there are multiple reviews.
        # We just want the latest review ID for each action item.
        # SQLAlchemy with outjoin and order_by descending on Review.created_at
        # means the first row for an action item has the latest review ID.
        
        items_dict = {}
        for action_item, meeting_title, review_id in rows:
            if action_item.id not in items_dict:
                items_dict[action_item.id] = ActionItemWithMeeting(
                    id=action_item.id,
                    meeting_id=action_item.meeting_id,
                    task=action_item.task,
                    owner_name=action_item.owner_name,
                    owner_id=action_item.owner_id,
                    deadline=action_item.deadline,
                    status=action_item.status,
                    confidence=action_item.confidence,
                    evidence=action_item.evidence,
                    source_location=action_item.source_location,
                    validation_status=action_item.validation_status,
                    review_status=action_item.review_status,
                    review_reasons=action_item.review_reasons,
                    created_at=action_item.created_at,
                    updated_at=action_item.updated_at,
                    meeting_title=meeting_title,
                    latest_review_id=review_id
                )
                
        return list(items_dict.values())

    async def update_action_item_status(
        self, db: AsyncSession, user_id: uuid.UUID, action_item_id: uuid.UUID, update_data: ActionItemUpdate
    ) -> ActionItemWithMeeting:
        query = (
            select(ActionItem, Meeting.title, Review.id)
            .join(Meeting, ActionItem.meeting_id == Meeting.id)
            .outerjoin(Review, Review.action_item_id == ActionItem.id)
            .where(
                and_(
                    ActionItem.id == action_item_id,
                    Meeting.user_id == user_id
                )
            )
            .order_by(Review.created_at.desc())
            .limit(1)
        )
        
        result = await db.execute(query)
        row = result.first()
        
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action item not found")
            
        action_item, meeting_title, review_id = row
        
        # Update only status
        action_item.status = update_data.status
        
        db.add(action_item)
        await db.commit()
        await db.refresh(action_item)
        
        return ActionItemWithMeeting(
            id=action_item.id,
            meeting_id=action_item.meeting_id,
            task=action_item.task,
            owner_name=action_item.owner_name,
            owner_id=action_item.owner_id,
            deadline=action_item.deadline,
            status=action_item.status,
            confidence=action_item.confidence,
            evidence=action_item.evidence,
            source_location=action_item.source_location,
            validation_status=action_item.validation_status,
            review_status=action_item.review_status,
            review_reasons=action_item.review_reasons,
            created_at=action_item.created_at,
            updated_at=action_item.updated_at,
            meeting_title=meeting_title,
            latest_review_id=review_id
        )
