import uuid
import enum
import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.sql import func
from app.db.base_class import Base

class ProcessingStatus(str, enum.Enum):
    UPLOADED = "UPLOADED"
    PROCESSING = "PROCESSING"
    EXTRACTING = "EXTRACTING"
    VALIDATING = "VALIDATING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class Meeting(Base):
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    meeting_date: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    source_type: Mapped[str | None] = mapped_column(String, nullable=True)
    processing_status: Mapped[ProcessingStatus] = mapped_column(SQLEnum(ProcessingStatus), nullable=False, index=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False
    )
    
    user: Mapped["User"] = relationship("User", back_populates="meetings")
    transcripts: Mapped[list["Transcript"]] = relationship("Transcript", back_populates="meeting", cascade="all, delete-orphan")
    participants: Mapped[list["Participant"]] = relationship("Participant", back_populates="meeting", cascade="all, delete-orphan")
    action_items: Mapped[list["ActionItem"]] = relationship("ActionItem", back_populates="meeting", cascade="all, delete-orphan")
