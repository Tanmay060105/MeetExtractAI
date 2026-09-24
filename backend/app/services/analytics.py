import uuid
import datetime
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, case

from app.models.meeting import Meeting
from app.models.action_item import ActionItem, ActionStatus, ReviewStatus
from app.models.participant import Participant
from app.schemas.analytics import (
    DashboardSummary, 
    InsightsDistribution, 
    StatusDistribution, 
    OwnerDistribution,
    ConfidenceDistribution,
    DeadlineDistribution
)

class AnalyticsService:
    async def get_dashboard_summary(self, db: AsyncSession, user_id: uuid.UUID) -> DashboardSummary:
        """
        Calculates high-level KPIs scoped to the authenticated user's meetings.
        Pending actions = unfinished actions = status != COMPLETED.
        Overdue actions = deadline < current UTC time AND status != COMPLETED.
        """
        now = datetime.datetime.now(datetime.timezone.utc)
        
        # 1. Total Meetings
        meetings_query = select(func.count(Meeting.id)).where(Meeting.user_id == user_id)
        total_meetings = (await db.execute(meetings_query)).scalar() or 0
        
        # 2. Action Item Stats
        action_stats_query = (
            select(
                func.count(ActionItem.id).label("total"),
                func.sum(case((ActionItem.status == ActionStatus.COMPLETED, 1), else_=0)).label("completed"),
                func.sum(case((ActionItem.status != ActionStatus.COMPLETED, 1), else_=0)).label("pending"),
                func.sum(case((ActionItem.review_status == ReviewStatus.NEEDS_REVIEW, 1), else_=0)).label("needs_review"),
                func.sum(case(
                    (and_(ActionItem.deadline < now, ActionItem.status != ActionStatus.COMPLETED), 1), 
                    else_=0
                )).label("overdue"),
                func.avg(ActionItem.confidence).label("avg_confidence")
            )
            .join(Meeting, ActionItem.meeting_id == Meeting.id)
            .where(Meeting.user_id == user_id)
        )
        
        result = (await db.execute(action_stats_query)).one_or_none()
        
        total_action_items = result.total or 0 if result else 0
        completed_actions = result.completed or 0 if result else 0
        pending_actions = result.pending or 0 if result else 0
        needs_review = result.needs_review or 0 if result else 0
        overdue_actions = result.overdue or 0 if result else 0
        
        # Avoid division by zero
        completion_rate = (completed_actions / total_action_items * 100) if total_action_items > 0 else 0.0
        average_confidence = float(result.avg_confidence) if result and result.avg_confidence else 0.0
        
        return DashboardSummary(
            total_meetings=total_meetings,
            total_action_items=total_action_items,
            completed_actions=int(completed_actions),
            pending_actions=int(pending_actions),
            needs_review=int(needs_review),
            overdue_actions=int(overdue_actions),
            completion_rate=round(completion_rate, 1),
            average_confidence=round(average_confidence, 2)
        )

    async def get_insights(self, db: AsyncSession, user_id: uuid.UUID) -> InsightsDistribution:
        """
        Calculates analytical distributions scoped to the authenticated user's meetings.
        """
        now = datetime.datetime.now(datetime.timezone.utc)
        seven_days_from_now = now + datetime.timedelta(days=7)

        # Base query joining meetings to ensure user isolation
        base_query = (
            select(ActionItem)
            .join(Meeting, ActionItem.meeting_id == Meeting.id)
            .where(Meeting.user_id == user_id)
        )
        
        # Execute query to get all items (at MVP scale this is fine, or we can use SQL GROUP BYs)
        # Using GROUP BYs for efficiency
        
        # By Status
        status_query = (
            select(ActionItem.status, func.count(ActionItem.id))
            .join(Meeting, ActionItem.meeting_id == Meeting.id)
            .where(Meeting.user_id == user_id)
            .group_by(ActionItem.status)
        )
        status_results = (await db.execute(status_query)).all()
        by_status = [StatusDistribution(status=str(row[0].value), count=row[1]) for row in status_results]
        
        # Ensure all statuses are present even if 0
        existing_statuses = {s.status for s in by_status}
        for s in ActionStatus:
            if s.value not in existing_statuses:
                by_status.append(StatusDistribution(status=s.value, count=0))
                
        # By Owner (resolved via Participant if available, else owner_name, else Unassigned)
        owner_query = (
            select(
                func.coalesce(Participant.name, ActionItem.owner_name, "Unassigned").label("owner_name_resolved"), 
                func.count(ActionItem.id)
            )
            .select_from(ActionItem)
            .join(Meeting, ActionItem.meeting_id == Meeting.id)
            .outerjoin(Participant, ActionItem.owner_id == Participant.id)
            .where(Meeting.user_id == user_id)
            .group_by("owner_name_resolved")
        )
        owner_results = (await db.execute(owner_query)).all()
        by_owner = [OwnerDistribution(owner=row[0], count=row[1]) for row in owner_results]
        # Sort by count descending
        by_owner.sort(key=lambda x: x.count, reverse=True)
        
        # By Confidence
        confidence_query = (
            select(
                func.sum(case((ActionItem.confidence >= 0.90, 1), else_=0)),
                func.sum(case((and_(ActionItem.confidence >= 0.70, ActionItem.confidence < 0.90), 1), else_=0)),
                func.sum(case((and_(ActionItem.confidence >= 0.0, ActionItem.confidence < 0.70), 1), else_=0))
            )
            .join(Meeting, ActionItem.meeting_id == Meeting.id)
            .where(and_(Meeting.user_id == user_id, ActionItem.confidence.isnot(None)))
        )
        conf_res = (await db.execute(confidence_query)).one_or_none()
        by_confidence = ConfidenceDistribution(
            high=int(conf_res[0] or 0) if conf_res else 0,
            medium=int(conf_res[1] or 0) if conf_res else 0,
            low=int(conf_res[2] or 0) if conf_res else 0
        )
        
        # By Deadline
        # Due soon MVP rule: deadline is within the next 7 days and status != COMPLETED
        deadline_query = (
            select(
                func.sum(case((and_(ActionItem.deadline < now, ActionItem.status != ActionStatus.COMPLETED), 1), else_=0)),
                func.sum(case((and_(ActionItem.deadline >= now, ActionItem.deadline <= seven_days_from_now, ActionItem.status != ActionStatus.COMPLETED), 1), else_=0)),
                func.sum(case((or_(ActionItem.deadline > seven_days_from_now, and_(ActionItem.deadline.isnot(None), ActionItem.status == ActionStatus.COMPLETED)), 1), else_=0)),
                func.sum(case((ActionItem.deadline.is_(None), 1), else_=0))
            )
            .join(Meeting, ActionItem.meeting_id == Meeting.id)
            .where(Meeting.user_id == user_id)
        )
        dead_res = (await db.execute(deadline_query)).one_or_none()
        by_deadline = DeadlineDistribution(
            overdue=int(dead_res[0] or 0) if dead_res else 0,
            due_soon=int(dead_res[1] or 0) if dead_res else 0,
            upcoming=int(dead_res[2] or 0) if dead_res else 0,
            no_deadline=int(dead_res[3] or 0) if dead_res else 0
        )
        
        return InsightsDistribution(
            by_status=by_status,
            by_owner=by_owner,
            by_confidence=by_confidence,
            by_deadline=by_deadline
        )
