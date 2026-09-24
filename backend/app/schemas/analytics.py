from pydantic import BaseModel
from typing import List, Dict

class DashboardSummary(BaseModel):
    total_meetings: int
    total_action_items: int
    completed_actions: int
    pending_actions: int
    needs_review: int
    overdue_actions: int
    completion_rate: float
    average_confidence: float

class StatusDistribution(BaseModel):
    status: str
    count: int

class OwnerDistribution(BaseModel):
    owner: str
    count: int

class ConfidenceDistribution(BaseModel):
    high: int
    medium: int
    low: int

class DeadlineDistribution(BaseModel):
    overdue: int
    due_soon: int
    upcoming: int
    no_deadline: int

class InsightsDistribution(BaseModel):
    by_status: List[StatusDistribution]
    by_owner: List[OwnerDistribution]
    by_confidence: ConfidenceDistribution
    by_deadline: DeadlineDistribution
