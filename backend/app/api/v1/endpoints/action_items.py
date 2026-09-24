from typing import List, Any
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.models.user import User
from app.schemas.action_item import ActionItemWithMeeting, ActionItemUpdate
from app.services.action_item import ActionItemService

router = APIRouter()

@router.get("", response_model=List[ActionItemWithMeeting])
async def list_action_items(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Retrieve all action items across the current user's meetings.
    """
    service = ActionItemService()
    return await service.get_user_action_items(db, user_id=current_user.id)

@router.patch("/{action_item_id}", response_model=ActionItemWithMeeting)
async def update_action_item_status(
    action_item_id: uuid.UUID,
    update_data: ActionItemUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Update the status of an action item.
    """
    service = ActionItemService()
    return await service.update_action_item_status(
        db, 
        user_id=current_user.id, 
        action_item_id=action_item_id, 
        update_data=update_data
    )
