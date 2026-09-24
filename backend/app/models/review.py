import uuid
import enum
import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from app.db.base_class import Base

class ReviewDecision(str, enum.Enum):
    APPROVED = "APPROVED"
    EDITED_AND_APPROVED = "EDITED_AND_APPROVED"
    REJECTED = "REJECTED"

class Review(Base):
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    action_item_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("action_items.id", ondelete="CASCADE"), index=True, nullable=False)
    reviewer_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    decision: Mapped[ReviewDecision] = mapped_column(SQLEnum(ReviewDecision), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    previous_value: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    new_value: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)
    
    action_item: Mapped["ActionItem"] = relationship("ActionItem", back_populates="reviews")
