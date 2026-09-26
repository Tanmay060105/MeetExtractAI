import asyncio
import io
import csv
import json
import uuid
from typing import Any
from fastapi import HTTPException

# Add backend directory to sys path so we can import from app
import sys
import os
sys.path.insert(0, os.path.abspath('.'))

from app.services.export import CSVExporter, JSONExporter, ExportService
from app.models.action_item import ActionStatus, ValidationStatus, ReviewStatus

def test_exporters():
    print("--- 2. CSV EDGE CASES & 3. EXTRACTED VS ASSIGNED OWNER ---")
    data = [
        {
            "id": "1234-5678",
            "task": "Task with comma, and \"quotes\", and\nnewlines, and ☃ (unicode)",
            "meeting": "Test Meeting",
            "extracted_owner": "Alice (AI extracted)",
            "assigned_owner": "Alice Smith (Participant)",
            "deadline": "2026-10-01",
            "status": "PENDING",
            "confidence": 0.95,
            "validation_status": "VALID",
            "review_status": "REVIEWED",
            "created_at": "2026-09-25T10:00:00Z"
        },
        {
            "id": "8765-4321",
            "task": "Simple task",
            "meeting": "Test Meeting 2",
            "extracted_owner": "Bob",
            "assigned_owner": "", # Null/Empty test
            "deadline": "",
            "status": "COMPLETED",
            "confidence": "",
            "validation_status": "UNKNOWN",
            "review_status": "READY",
            "created_at": "2026-09-25T11:00:00Z"
        }
    ]
    
    csv_out = CSVExporter.export(data)
    # Parse back
    f = io.StringIO(csv_out)
    reader = csv.DictReader(f)
    rows = list(reader)
    
    assert len(rows) == 2
    row0 = rows[0]
    assert row0["Task"] == "Task with comma, and \"quotes\", and\nnewlines, and ☃ (unicode)"
    assert row0["Extracted Owner"] == "Alice (AI extracted)"
    assert row0["Assigned Owner"] == "Alice Smith (Participant)"
    
    row1 = rows[1]
    assert row1["Assigned Owner"] == ""
    assert row1["Deadline"] == ""
    
    print("CSV Edge Cases PASS")
    print("Owner Distinction PASS")
    print()

async def test_nonexistent_id():
    print("--- 1. NONEXISTENT ID BEHAVIOR ---")
    
    class MockResult:
        def __init__(self, rows):
            self._rows = rows
        def all(self):
            return self._rows
            
    class MockActionItem:
        def __init__(self, id, owner_name, task):
            self.id = id
            self.owner_name = owner_name
            self.task = task
            self.deadline = None
            self.status = None
            self.confidence = None
            self.validation_status = None
            self.review_status = None
            self.created_at = None
            
    class MockDB:
        def __init__(self, authorized_user_id):
            self.authorized_user_id = authorized_user_id
            
        async def execute(self, query):
            # We mock that one item exists and belongs to the user
            item = MockActionItem(uuid.UUID("00000000-0000-0000-0000-000000000001"), "Bob", "Test")
            # Row structure: (ActionItem, meeting_title, meeting_user_id, participant_name)
            return MockResult([(item, "Meeting", self.authorized_user_id, "Bob Smith")])

    user_id = uuid.UUID("11111111-1111-1111-1111-111111111111")
    db = MockDB(user_id)
    service = ExportService()
    
    existing_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
    nonexistent_id = uuid.UUID("99999999-9999-9999-9999-999999999999")
    
    try:
        await service.export_action_items(db, user_id, [existing_id, nonexistent_id], "csv")
        print("FAIL: Expected HTTPException")
    except HTTPException as e:
        print(f"PASS: Raised HTTPException with status {e.status_code}")
        print(f"Detail: {e.detail}")
        assert e.status_code == 403

if __name__ == "__main__":
    test_exporters()
    asyncio.run(test_nonexistent_id())
