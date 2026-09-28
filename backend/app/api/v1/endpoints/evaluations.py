import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api import deps
from app.models.user import User
from app.models.evaluation import EvaluationDataset, EvaluationSample, EvaluationRun, EvaluationResult, EvaluationRunStatus
from app.schemas.evaluation import (
    EvaluationDatasetCreate, EvaluationDatasetResponse, EvaluationDatasetDetailResponse,
    EvaluationSampleCreate, EvaluationSampleResponse,
    EvaluationRunCreate, EvaluationRunResponse, EvaluationResultResponse
)
from app.services.evaluation import EvaluationService
from app.core.config import settings

router = APIRouter()
evaluation_service = EvaluationService()

# --- Datasets ---

@router.post("/datasets", response_model=EvaluationDatasetResponse, status_code=status.HTTP_201_CREATED)
async def create_dataset(
    *,
    db: AsyncSession = Depends(deps.get_db),
    dataset_in: EvaluationDatasetCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> EvaluationDataset:
    dataset = EvaluationDataset(
        user_id=current_user.id,
        name=dataset_in.name,
        description=dataset_in.description,
        version=dataset_in.version
    )
    db.add(dataset)
    await db.commit()
    await db.refresh(dataset)
    return dataset

@router.get("/datasets", response_model=List[EvaluationDatasetResponse])
async def list_datasets(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> List[EvaluationDataset]:
    result = await db.execute(
        select(EvaluationDataset).where(EvaluationDataset.user_id == current_user.id).order_by(EvaluationDataset.created_at.desc())
    )
    return result.scalars().all()

@router.get("/datasets/{id}", response_model=EvaluationDatasetDetailResponse)
async def get_dataset(
    id: uuid.UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> EvaluationDataset:
    result = await db.execute(
        select(EvaluationDataset).where(EvaluationDataset.id == id, EvaluationDataset.user_id == current_user.id)
    )
    dataset = result.scalar_one_or_none()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    samples_result = await db.execute(
        select(EvaluationSample).where(EvaluationSample.dataset_id == id).order_by(EvaluationSample.created_at.asc())
    )
    samples = samples_result.scalars().all()
    
    # We use a manual construction to satisfy the Pydantic schema easily
    dataset_dict = {
        "id": dataset.id,
        "name": dataset.name,
        "description": dataset.description,
        "version": dataset.version,
        "created_at": dataset.created_at,
        "samples": samples
    }
    return dataset_dict

@router.post("/datasets/{id}/samples", response_model=EvaluationSampleResponse, status_code=status.HTTP_201_CREATED)
async def add_sample(
    id: uuid.UUID,
    *,
    db: AsyncSession = Depends(deps.get_db),
    sample_in: EvaluationSampleCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> EvaluationSample:
    # Verify dataset belongs to user
    result = await db.execute(
        select(EvaluationDataset).where(EvaluationDataset.id == id, EvaluationDataset.user_id == current_user.id)
    )
    dataset = result.scalar_one_or_none()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    sample = EvaluationSample(
        dataset_id=id,
        transcript=sample_in.transcript,
        ground_truth=sample_in.ground_truth
    )
    db.add(sample)
    await db.commit()
    await db.refresh(sample)
    return sample

# --- Runs ---

@router.post("/runs", response_model=EvaluationRunResponse, status_code=status.HTTP_201_CREATED)
async def create_run(
    *,
    db: AsyncSession = Depends(deps.get_db),
    run_in: EvaluationRunCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(deps.get_current_active_user),
) -> EvaluationRun:
    from app.services.concurrency import acquire_user_advisory_lock, enforce_evaluation_concurrency_limit
    await acquire_user_advisory_lock(db, current_user.id)
    await enforce_evaluation_concurrency_limit(db, current_user.id)

    # Verify dataset belongs to user
    result = await db.execute(
        select(EvaluationDataset).where(EvaluationDataset.id == run_in.dataset_id, EvaluationDataset.user_id == current_user.id)
    )
    dataset = result.scalar_one_or_none()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    run = EvaluationRun(
        user_id=current_user.id,
        dataset_id=run_in.dataset_id,
        model_version=settings.AI_MODEL,
        prompt_version="v1-hardcoded",
        status=EvaluationRunStatus.PENDING
    )
    db.add(run)
    await db.commit()
    await db.refresh(run)
    
    # Needs a separate session for background task since the request db session will close
    # Using a helper inside the background task or just pass the run id and create a new session there
    background_tasks.add_task(run_evaluation_background, run.id, dataset.id)
    
    return run

async def run_evaluation_background(run_id: uuid.UUID, dataset_id: uuid.UUID):
    from app.db.session import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        await evaluation_service.execute_run(db, run_id, dataset_id)

@router.get("/runs", response_model=List[EvaluationRunResponse])
async def list_runs(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> List[EvaluationRun]:
    result = await db.execute(
        select(EvaluationRun).where(EvaluationRun.user_id == current_user.id).order_by(EvaluationRun.started_at.desc())
    )
    return result.scalars().all()

@router.get("/runs/{id}", response_model=EvaluationRunResponse)
async def get_run(
    id: uuid.UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> EvaluationRun:
    result = await db.execute(
        select(EvaluationRun).where(EvaluationRun.id == id, EvaluationRun.user_id == current_user.id)
    )
    run = result.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return run

@router.get("/runs/{id}/results", response_model=List[EvaluationResultResponse])
async def get_run_results(
    id: uuid.UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> List[EvaluationResult]:
    # Verify run belongs to user
    run_result = await db.execute(
        select(EvaluationRun).where(EvaluationRun.id == id, EvaluationRun.user_id == current_user.id)
    )
    run = run_result.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
        
    result = await db.execute(
        select(EvaluationResult).where(EvaluationResult.run_id == id).order_by(EvaluationResult.created_at.asc())
    )
    return result.scalars().all()
