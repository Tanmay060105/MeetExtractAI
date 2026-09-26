import csv
import io
import json
import uuid
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.models.action_item import ActionItem
from app.models.meeting import Meeting
from app.models.participant import Participant


class CSVExporter:
    @staticmethod
    def export(data: List[Dict[str, Any]]) -> str:
        output = io.StringIO()
        # Headers: ID, Task, Meeting, Extracted Owner, Assigned Owner, Deadline, Status, Confidence, Validation Status, Review Status, Created At
        fieldnames = [
            "id", "task", "meeting", "extracted_owner", "assigned_owner",
            "deadline", "status", "confidence", "validation_status", "review_status", "created_at"
        ]
        
        # We'll map the internal keys to the nice headers
        header_mapping = {
            "id": "ID",
            "task": "Task",
            "meeting": "Meeting",
            "extracted_owner": "Extracted Owner",
            "assigned_owner": "Assigned Owner",
            "deadline": "Deadline",
            "status": "Status",
            "confidence": "Confidence",
            "validation_status": "Validation Status",
            "review_status": "Review Status",
            "created_at": "Created At"
        }
        
        writer = csv.DictWriter(output, fieldnames=fieldnames, quoting=csv.QUOTE_MINIMAL)
        # Write custom headers
        writer.writerow(header_mapping)
        
        for row in data:
            writer.writerow(row)
            
        return output.getvalue()


class JSONExporter:
    @staticmethod
    def export(data: List[Dict[str, Any]]) -> str:
        return json.dumps(data, indent=2)


class ExportService:
    async def export_action_items(
        self, db: AsyncSession, user_id: uuid.UUID, action_item_ids: List[uuid.UUID], format: str
    ) -> str:
        if not action_item_ids:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot export an empty list")

        # 1. Retrieve records and validate authorization
        query = (
            select(ActionItem, Meeting.title, Meeting.user_id, Participant.name)
            .join(Meeting, ActionItem.meeting_id == Meeting.id)
            .outerjoin(Participant, ActionItem.owner_id == Participant.id)
            .where(ActionItem.id.in_(action_item_ids))
        )
        
        result = await db.execute(query)
        rows = result.all()
        
        # Build mapping and check ownership
        record_map = {}
        for action_item, meeting_title, meeting_user_id, participant_name in rows:
            if meeting_user_id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN, 
                    detail="One or more requested items do not belong to the authenticated user"
                )
            
            # Format the output row
            record_map[action_item.id] = {
                "id": str(action_item.id),
                "task": action_item.task or "",
                "meeting": meeting_title or "",
                "extracted_owner": action_item.owner_name or "",
                "assigned_owner": participant_name or "",
                "deadline": action_item.deadline.strftime("%Y-%m-%d") if action_item.deadline else "",
                "status": action_item.status.value if action_item.status else "",
                "confidence": round(action_item.confidence, 2) if action_item.confidence is not None else "",
                "validation_status": action_item.validation_status.value if action_item.validation_status else "",
                "review_status": action_item.review_status.value if action_item.review_status else "",
                "created_at": action_item.created_at.isoformat() if action_item.created_at else ""
            }

        # Check for non-existent IDs
        if len(record_map) != len(set(action_item_ids)):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="One or more requested items do not exist or do not belong to the authenticated user"
            )

        # 4. Reconstruct records using the exact submitted ID sequence
        ordered_data = []
        # Use a set to avoid duplicates if the client sent duplicate IDs
        seen = set()
        for item_id in action_item_ids:
            if item_id not in seen:
                ordered_data.append(record_map[item_id])
                seen.add(item_id)

        # 5. Pass to exporter
        if format == "csv":
            return CSVExporter.export(ordered_data)
        elif format == "json":
            return JSONExporter.export(ordered_data)
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported format")
