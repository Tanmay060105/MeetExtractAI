from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Any
import uuid

from app.api import deps
from app.models.user import User
from app.models.meeting import Meeting
from app.models.action_item import ActionItem
from app.services.validation import ValidationService

router = APIRouter()

@router.post("/{meeting_id}/validate", status_code=status.HTTP_200_OK)
async def validate_action_items(
    meeting_id: uuid.UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Trigger validation for extracted action items of a meeting.
    """
    print("Validate endpoint called")
    # Verify meeting belongs to user
    print("Executing query 1")
    result = await db.execute(select(Meeting).where(Meeting.id == meeting_id, Meeting.user_id == current_user.id))
    print("Executed query 1")
    meeting = result.scalar_one_or_none()
    
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")

    # Load action items
    actions_result = await db.execute(select(ActionItem).where(ActionItem.meeting_id == meeting_id))
    action_items = actions_result.scalars().all()
    
    if not action_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="No action items found for this meeting to validate"
        )
    
    try:
        validation_service = ValidationService()
        summary = await validation_service.validate_action_items(db, meeting_id, list(action_items))
        await db.commit()
        return summary
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Validation failed: {str(e)}"
        )
