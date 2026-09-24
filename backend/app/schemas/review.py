import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field

from app.models.review import ReviewDecision
from app.models.action_item import ActionStatus, ValidationStatus, ReviewStatus

class ActionItemEdit(BaseModel):
    task: Optional[str] = None
    owner_name: Optional[str] = None
    deadline: Optional[datetime] = None
    status: Optional[ActionStatus] = None

class ReviewCreate(BaseModel):
    decision: ReviewDecision
    notes: Optional[str] = None
    edits: Optional[ActionItemEdit] = None

class ReviewResponse(BaseModel):
    id: uuid.UUID
    action_item_id: uuid.UUID
    reviewer_id: Optional[uuid.UUID] = None
    decision: ReviewDecision
    notes: Optional[str] = None
    previous_value: Optional[Dict[str, Any]] = None
    new_value: Optional[Dict[str, Any]] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ReviewQueueItem(BaseModel):
    id: uuid.UUID
    meeting_id: uuid.UUID
    meeting_title: str
    task: str
    owner_name: Optional[str] = None
    deadline: Optional[datetime] = None
    status: ActionStatus
    confidence: Optional[float] = None
    evidence: Optional[str] = None
    validation_status: ValidationStatus
    review_status: ReviewStatus
    review_reasons: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime
    
class ReviewDetailResponse(BaseModel):
    action_item: ReviewQueueItem
    transcript_context: Optional[str] = None
    reviews: List[ReviewResponse] = Field(default_factory=list)
