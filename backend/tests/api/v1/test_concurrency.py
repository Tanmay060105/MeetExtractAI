import pytest
import asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.meeting import Meeting, ProcessingStatus
from app.models.evaluation import EvaluationDataset
from app.core.security import create_access_token

@pytest.mark.asyncio
async def test_meeting_concurrency_limit_sequential(async_client: AsyncClient, db_session: AsyncSession, normal_user_token_headers):
    headers = normal_user_token_headers
    
    import jwt
    from app.core.config import settings
    token = headers["Authorization"].replace("Bearer ", "")
    decoded = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM], options={"verify_signature": False})
    user_id_str = decoded["sub"]
    
    payload = {"title": "Seq", "text": "test", "source_type": "TEXT"}
    
    # 1. Below limit behavior (admit successfully)
    # Right now active count is 0
    resp = await async_client.post("/api/v1/meetings/text", json=payload, headers=headers)
    assert resp.status_code == 201
        
    # 2. At-limit behavior (reject)
    # We will manually insert 3 active meetings into the DB to simulate at-limit
    from app.models.meeting import Meeting, ProcessingStatus
    import uuid
    for _ in range(3):
        m = Meeting(id=uuid.uuid4(), user_id=uuid.UUID(user_id_str), title="Mock", source_type="TEXT", processing_status=ProcessingStatus.PROCESSING)
        db_session.add(m)
    await db_session.commit()
    
    # Now active count is exactly 3 (the ones we just inserted).
    # The next one should be rejected by the limit!
    resp4 = await async_client.post("/api/v1/meetings/text", json=payload, headers=headers)
    assert resp4.status_code == 429
    assert "already have 3 active" in resp4.json()["detail"] or "concurrent requests" in resp4.json()["detail"]

@pytest.mark.asyncio
async def test_meeting_concurrency_limit_rapid(async_client: AsyncClient, db_session: AsyncSession, normal_user_token_headers):
    headers = normal_user_token_headers
    payload = {"title": "Rapid", "text": "test", "source_type": "TEXT"}
    
    # Send 5 simultaneously
    tasks = [async_client.post("/api/v1/meetings/text", json=payload, headers=headers) for _ in range(5)]
    responses = await asyncio.gather(*tasks)
    
    statuses = [r.status_code for r in responses]
    successes = statuses.count(201)
    ratelimits = statuses.count(429)
    
    assert successes <= 3
    assert successes + ratelimits == 5
    # The lock intentionally rejects contenders that can't acquire the lock immediately.
    # Therefore we expect some to be rejected by the lock contention.

@pytest.mark.asyncio
async def test_evaluation_concurrency_limit(async_client: AsyncClient, db_session: AsyncSession, normal_user_token_headers):
    headers = normal_user_token_headers
    
    import jwt
    from app.core.config import settings
    token = headers["Authorization"].replace("Bearer ", "")
    decoded = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM], options={"verify_signature": False})
    user_id_str = decoded["sub"]
    
    ds_res = await async_client.post("/api/v1/evaluations/datasets", json={"name": "Test", "description": "Test", "version": "1"}, headers=headers)
    ds_id = ds_res.json()["id"]
    
    payload = {"dataset_id": str(ds_id)}
    
    # 1. Below limit behavior (admit successfully)
    resp = await async_client.post("/api/v1/evaluations/runs", json=payload, headers=headers)
    assert resp.status_code == 201
        
    # 2. At-limit behavior (reject)
    from app.models.evaluation import EvaluationRun, EvaluationRunStatus
    import uuid
    for _ in range(3):
        r = EvaluationRun(id=uuid.uuid4(), user_id=uuid.UUID(user_id_str), dataset_id=uuid.UUID(ds_id), model_version="v1", prompt_version="v1", status=EvaluationRunStatus.RUNNING)
        db_session.add(r)
    await db_session.commit()
    
    # Now active count is exactly 3 (from mock insert).
    # The next one should be rejected by the limit!
    resp4 = await async_client.post("/api/v1/evaluations/runs", json=payload, headers=headers)
    assert resp4.status_code == 429
