import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import NullPool

from app.main import app
from app.core.config import settings
from app.db.session import get_db

engine = create_async_engine(settings.DATABASE_URL, echo=False, poolclass=NullPool)
TestingSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

@pytest_asyncio.fixture
async def db_session():
    async with TestingSessionLocal() as session:
        # Clean the database before every test to ensure isolation across tests,
        # especially since endpoints use their own db_session which commits data.
        from sqlalchemy import text
        from app.db.base_class import Base
        
        await session.execute(text("TRUNCATE TABLE users, meetings, transcripts, participants, action_items CASCADE;"))
        await session.commit()
        
        yield session
        await session.rollback()
        await session.close()

@pytest_asyncio.fixture
async def async_client(db_session: AsyncSession):
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
        
    app.dependency_overrides.clear()

from app.models.user import User
from app.core.security import get_password_hash, create_access_token
import uuid

@pytest_asyncio.fixture
async def normal_user_token_headers(db_session: AsyncSession) -> dict[str, str]:
    user = User(
        email=f"user_{uuid.uuid4()}@example.com",
        full_name="Test User",
        hashed_password=get_password_hash("password")
    )
    db_session.add(user)
    await db_session.commit()
    token = create_access_token(subject=user.id)
    return {"Authorization": f"Bearer {token}"}

@pytest_asyncio.fixture
async def admin_token_headers(db_session: AsyncSession) -> dict[str, str]:
    user = User(
        email=f"admin_{uuid.uuid4()}@example.com",
        full_name="Admin User",
        hashed_password=get_password_hash("password")
    )
    db_session.add(user)
    await db_session.commit()
    token = create_access_token(subject=user.id)
    return {"Authorization": f"Bearer {token}"}
