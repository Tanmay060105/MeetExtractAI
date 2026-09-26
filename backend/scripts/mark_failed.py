import asyncio
from app.db.session import AsyncSessionLocal
from sqlalchemy import text

async def main():
    async with AsyncSessionLocal() as session:
        await session.execute(text("UPDATE meetings SET processing_status = 'FAILED' WHERE processing_status = 'PROCESSING'"))
        await session.commit()
        print("Updated stuck meetings to FAILED")

asyncio.run(main())
