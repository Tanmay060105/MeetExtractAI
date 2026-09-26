import uuid
from typing import List, Literal
from pydantic import BaseModel, Field

class ExportRequest(BaseModel):
    format: Literal["csv", "json"] = Field(..., description="The format to export: csv or json")
    action_item_ids: List[uuid.UUID] = Field(..., description="List of ActionItem IDs to export in order")
