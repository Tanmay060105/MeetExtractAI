from pydantic import BaseModel, Field, ConfigDict
import uuid
import datetime
from app.models.meeting import ProcessingStatus

class MeetingBase(BaseModel):
    title: str = Field(max_length=255)
    description: str | None = None
    meeting_date: datetime.datetime | None = None
    source_type: str | None = None

class MeetingTextCreate(MeetingBase):
    text: str

class MeetingResponse(MeetingBase):
    id: uuid.UUID
    user_id: uuid.UUID
    processing_status: ProcessingStatus
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
