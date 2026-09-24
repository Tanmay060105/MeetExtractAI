import asyncio
from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.core.security import create_access_token
from sqlalchemy import select

async def get_token():
    async with AsyncSessionLocal() as db:
        user = (await db.execute(select(User))).scalars().first()
        return create_access_token(user.id)

print(asyncio.run(get_token()))
