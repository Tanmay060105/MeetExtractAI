import uuid
import enum
import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text, DateTime, ForeignKey, Float, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from app.db.base_class import Base

class ActionStatus(str, enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    BLOCKED = "BLOCKED"
    NEEDS_REVIEW = "NEEDS_REVIEW"

class ValidationStatus(str, enum.Enum):
    VALID = "VALID"
    INVALID = "INVALID"
    AMBIGUOUS = "AMBIGUOUS"
    UNKNOWN = "UNKNOWN"

class ReviewStatus(str, enum.Enum):
    READY = "READY"
    NEEDS_REVIEW = "NEEDS_REVIEW"
    REVIEWED = "REVIEWED"
    REJECTED = "REJECTED"

class ActionItem(Base):
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    meeting_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("meetings.id", ondelete="CASCADE"), index=True, nullable=False)
    task: Mapped[str] = mapped_column(Text, nullable=False)
    owner_name: Mapped[str | None] = mapped_column(String, nullable=True)
    owner_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("participants.id", ondelete="SET NULL"), nullable=True)
    deadline: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True), index=True, nullable=True)
    status: Mapped[ActionStatus] = mapped_column(SQLEnum(ActionStatus), nullable=False, index=True)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    evidence: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_location: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    validation_status: Mapped[ValidationStatus] = mapped_column(SQLEnum(ValidationStatus), nullable=False)
    review_status: Mapped[ReviewStatus] = mapped_column(SQLEnum(ReviewStatus), nullable=False, index=True)
    review_reasons: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False
    )
    
    meeting: Mapped["Meeting"] = relationship("Meeting", back_populates="action_items")
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="action_item", cascade="all, delete-orphan")
