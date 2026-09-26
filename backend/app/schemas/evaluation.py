import uuid
import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel

from app.models.evaluation import EvaluationRunStatus

# Dataset Schemas
class EvaluationDatasetCreate(BaseModel):
    name: str
    description: Optional[str] = None
    version: str

class EvaluationDatasetResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str]
    version: str
    created_at: datetime.datetime
    
    class Config:
        from_attributes = True

# Sample Schemas
class EvaluationSampleCreate(BaseModel):
    transcript: str
    ground_truth: Dict[str, Any]

class EvaluationSampleResponse(BaseModel):
    id: uuid.UUID
    dataset_id: uuid.UUID
    transcript: str
    ground_truth: Dict[str, Any]
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Dataset with Samples (for detailed GET)
class EvaluationDatasetDetailResponse(EvaluationDatasetResponse):
    samples: List[EvaluationSampleResponse] = []

# Run Schemas
class EvaluationRunCreate(BaseModel):
    dataset_id: uuid.UUID

class EvaluationRunResponse(BaseModel):
    id: uuid.UUID
    dataset_id: uuid.UUID
    model_version: str
    prompt_version: str
    status: EvaluationRunStatus
    started_at: datetime.datetime
    completed_at: Optional[datetime.datetime]
    
    class Config:
        from_attributes = True

# Result Schemas
class EvaluationResultResponse(BaseModel):
    id: uuid.UUID
    run_id: uuid.UUID
    sample_id: uuid.UUID
    prediction: Optional[Dict[str, Any]]
    ground_truth: Dict[str, Any]
    metrics: Optional[Dict[str, Any]]
    failure_type: Optional[str]
    created_at: datetime.datetime

    class Config:
        from_attributes = True
