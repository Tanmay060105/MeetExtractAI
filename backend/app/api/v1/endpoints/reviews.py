from typing import List, Any
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.models.user import User
from app.schemas.review import ReviewQueueItem, ReviewDetailResponse, ReviewCreate
from app.services.review import ReviewService

router = APIRouter()

@router.get("/pending", response_model=List[ReviewQueueItem])
async def get_pending_reviews(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Retrieve action items that require review for the current user's meetings.
    """
    review_service = ReviewService()
    return await review_service.get_needs_review_items(db, user_id=current_user.id)

@router.get("/{action_item_id}", response_model=ReviewDetailResponse)
async def get_review_details(
    action_item_id: uuid.UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Retrieve detailed context for reviewing a specific action item.
    """
    review_service = ReviewService()
    return await review_service.get_review_details(db, user_id=current_user.id, action_item_id=action_item_id)

@router.post("/{action_item_id}", response_model=ReviewQueueItem)
async def submit_review_decision(
    action_item_id: uuid.UUID,
    review_data: ReviewCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Submit a review decision for an action item (APPROVED, EDITED_AND_APPROVED, or REJECTED).
    """
    review_service = ReviewService()
    return await review_service.submit_review_decision(
        db, 
        user_id=current_user.id, 
        action_item_id=action_item_id, 
        review_data=review_data
    )
