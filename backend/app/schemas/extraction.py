from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.models.action_item import ActionStatus

class ExtractedAction(BaseModel):
    task: str = Field(description="The concrete action that someone committed to performing. Do not fabricate.")
    owner_name: Optional[str] = Field(default=None, description="The person responsible, if identifiable. Null if not explicitly stated or implied.")
    deadline: Optional[datetime] = Field(default=None, description="The deadline if explicitly stated or confidently inferable.")
    status: ActionStatus = Field(default=ActionStatus.PENDING, description="The current status of the action item. Defaults to PENDING.")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="A provisional model confidence value between 0.0 and 1.0.")
    evidence: Optional[str] = Field(default=None, description="A concise supporting quote/reference from the transcript. Null if none.")
    source_location: Optional[dict] = Field(default=None, description="Where the action originated. Can include start_time, end_time, or line_number.")

class ExtractionResult(BaseModel):
    actions: List[ExtractedAction] = Field(description="List of action items extracted from the transcript. Empty if none found.")
