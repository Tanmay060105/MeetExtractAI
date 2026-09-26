import asyncio
import uuid
import sys
from app.db.session import AsyncSessionLocal
from app.services.evaluation import EvaluationService

async def main():
    run_id = uuid.UUID(sys.argv[1])
    dataset_id = uuid.UUID(sys.argv[2])
    async with AsyncSessionLocal() as db:
        service = EvaluationService()
        await service.execute_run(db, run_id, dataset_id)

if __name__ == "__main__":
    asyncio.run(main())
