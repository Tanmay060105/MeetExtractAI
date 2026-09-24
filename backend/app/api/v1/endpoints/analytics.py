from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.models.user import User
from app.schemas.analytics import DashboardSummary, InsightsDistribution
from app.services.analytics import AnalyticsService

router = APIRouter()

@router.get("/dashboard", response_model=DashboardSummary)
async def get_dashboard_summary(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Retrieve high-level dashboard KPIs for the authenticated user's meetings.
    """
    service = AnalyticsService()
    return await service.get_dashboard_summary(db, user_id=current_user.id)

@router.get("/insights", response_model=InsightsDistribution)
async def get_insights_distribution(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Retrieve analytical distributions (status, owner, confidence, deadlines) 
    for the authenticated user's meetings.
    """
    service = AnalyticsService()
    return await service.get_insights(db, user_id=current_user.id)
