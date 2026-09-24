from pydantic import BaseModel, ConfigDict
import uuid
import datetime

class TranscriptBase(BaseModel):
    raw_text: str
    normalized_text: str | None = None
    source_filename: str | None = None

class TranscriptCreate(TranscriptBase):
    meeting_id: uuid.UUID

class TranscriptResponse(TranscriptBase):
    id: uuid.UUID
    meeting_id: uuid.UUID
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
