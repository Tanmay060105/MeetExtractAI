from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any

from app.api import deps
from app.models.user import User
from app.schemas.export import ExportRequest
from app.services.export import ExportService

router = APIRouter()

@router.post("/action-items")
async def export_action_items(
    request: ExportRequest,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Export the provided list of action items as CSV or JSON.
    """
    service = ExportService()
    content = await service.export_action_items(
        db=db,
        user_id=current_user.id,
        action_item_ids=request.action_item_ids,
        format=request.format
    )

    media_type = "text/csv" if request.format == "csv" else "application/json"
    filename = f"action_items_export.{request.format}"
    
    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
