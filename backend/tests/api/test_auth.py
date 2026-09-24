import pytest
import uuid
import jwt
import datetime
import jwt
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.models.user import User
from app.core.security import get_password_hash, create_access_token

@pytest.fixture
def unique_email():
    return f"testuser_{uuid.uuid4()}@example.com"

@pytest.fixture
def inactive_email():
    return f"inactive_{uuid.uuid4()}@example.com"

@pytest.fixture
def valid_password():
    return "secure_password123"

@pytest.mark.asyncio
async def test_register_user_success(async_client: AsyncClient, unique_email: str, valid_password: str, db_session: AsyncSession):
    response = await async_client.post(
        "/api/v1/auth/register",
        json={"email": unique_email, "full_name": "Test User", "password": valid_password}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == unique_email
    assert data["full_name"] == "Test User"
    assert "hashed_password" not in data
    assert "id" in data
    assert data["is_active"] is True

    # Verify DB insertion and password hashing
    result = await db_session.execute(select(User).where(User.email == unique_email))
    user_in_db = result.scalars().first()
    assert user_in_db is not None
    assert user_in_db.hashed_password != valid_password  # Must be hashed

@pytest.mark.asyncio
async def test_register_duplicate_email(async_client: AsyncClient, unique_email: str, valid_password: str):
    # Register first time
    await async_client.post(
        "/api/v1/auth/register",
        json={"email": unique_email, "full_name": "Test User", "password": valid_password}
    )
    # Register second time
    response = await async_client.post(
        "/api/v1/auth/register",
        json={"email": unique_email, "full_name": "Test User 2", "password": valid_password}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

@pytest.mark.asyncio
async def test_login_success(async_client: AsyncClient, unique_email: str, valid_password: str):
    await async_client.post(
        "/api/v1/auth/register",
        json={"email": unique_email, "full_name": "Test User", "password": valid_password}
    )
    response = await async_client.post(
        "/api/v1/auth/login/access-token",
        data={"username": unique_email, "password": valid_password}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_login_invalid_password(async_client: AsyncClient, unique_email: str, valid_password: str):
    await async_client.post(
        "/api/v1/auth/register",
        json={"email": unique_email, "full_name": "Test User", "password": valid_password}
    )
    response = await async_client.post(
        "/api/v1/auth/login/access-token",
        data={"username": unique_email, "password": "wrong_password"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"

@pytest.mark.asyncio
async def test_login_unknown_email(async_client: AsyncClient, unique_email: str, valid_password: str):
    response = await async_client.post(
        "/api/v1/auth/login/access-token",
        data={"username": unique_email, "password": valid_password}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"

@pytest.mark.asyncio
async def test_get_me_success(async_client: AsyncClient, unique_email: str, valid_password: str):
    await async_client.post(
        "/api/v1/auth/register",
        json={"email": unique_email, "full_name": "Test User", "password": valid_password}
    )
    login_response = await async_client.post(
        "/api/v1/auth/login/access-token",
        data={"username": unique_email, "password": valid_password}
    )
    token = login_response.json()["access_token"]

    response = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == unique_email
    assert "hashed_password" not in data

@pytest.mark.asyncio
async def test_get_me_missing_header(async_client: AsyncClient):
    response = await async_client.get("/api/v1/auth/me")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_get_me_malformed_token(async_client: AsyncClient):
    response = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer not.a.valid.jwt"}
    )
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_get_me_invalid_signature(async_client: AsyncClient, unique_email: str, valid_password: str):
    await async_client.post(
        "/api/v1/auth/register",
        json={"email": unique_email, "full_name": "Test User", "password": valid_password}
    )
    login_response = await async_client.post(
        "/api/v1/auth/login/access-token",
        data={"username": unique_email, "password": valid_password}
    )
    token = login_response.json()["access_token"]
    
    # Tamper with token signature
    tampered_token = token[:-5] + "aaaaa"

    response = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {tampered_token}"}
    )
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_get_me_expired_token(async_client: AsyncClient, db_session: AsyncSession, unique_email: str, valid_password: str):
    # Register user
    user = User(email=unique_email, full_name="Test", hashed_password="foo")
    db_session.add(user)
    await db_session.commit()

    # Create expired token directly
    expired_delta = datetime.timedelta(minutes=-10)
    token = create_access_token(subject=user.id, expires_delta=expired_delta)
    
    response = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_get_me_inactive_user(async_client: AsyncClient, db_session: AsyncSession, inactive_email: str):
    user = User(
        email=inactive_email,
        full_name="Inactive",
        hashed_password=get_password_hash("foo"),
        is_active=False
    )
    db_session.add(user)
    await db_session.commit()

    token = create_access_token(subject=user.id)
    
    # Try to login directly should fail
    response = await async_client.post(
        "/api/v1/auth/login/access-token",
        data={"username": inactive_email, "password": "foo"}
    )
    assert response.status_code == 403
    assert response.json()["detail"] == "Inactive user"

    # Try to access /me with generated token should fail
    response = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 403
    assert response.json()["detail"] == "Inactive user"

@pytest.mark.asyncio
async def test_get_me_nonexistent_user(async_client: AsyncClient):
    token = create_access_token(subject=uuid.uuid4())
    
    response = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_get_me_invalid_subject(async_client: AsyncClient):
    # Payload without 'sub'
    to_encode = {"exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=10)}
    token = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    
    response = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 401
