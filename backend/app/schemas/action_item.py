from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
from app.models.action_item import ActionStatus, ValidationStatus, ReviewStatus

class ActionItemBase(BaseModel):
    task: str
    owner_name: Optional[str] = None
    owner_id: Optional[uuid.UUID] = None
    deadline: Optional[datetime] = None
    status: ActionStatus = ActionStatus.PENDING
    confidence: Optional[float] = None
    evidence: Optional[str] = None
    source_location: Optional[Dict[str, Any]] = None
    validation_status: ValidationStatus
    review_status: ReviewStatus
    review_reasons: Optional[List[str]] = None

class ActionItemResponse(ActionItemBase):
    id: uuid.UUID
    meeting_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ActionItemUpdate(BaseModel):
    status: ActionStatus

class ActionItemWithMeeting(ActionItemResponse):
    meeting_title: str
    latest_review_id: Optional[uuid.UUID] = None
