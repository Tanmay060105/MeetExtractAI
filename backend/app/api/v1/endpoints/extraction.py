from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any
import uuid

from app.api import deps
from app.models.user import User
from app.services.extraction import ExtractionService

router = APIRouter()

@router.post("/{meeting_id}/extract", status_code=status.HTTP_200_OK)
async def extract_action_items(
    meeting_id: uuid.UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Trigger AI extraction of action items from a meeting transcript.
    """
    extraction_service = ExtractionService()
    result = await extraction_service.extract_meeting_actions(db=db, meeting_id=meeting_id, user_id=current_user.id)
    return result
