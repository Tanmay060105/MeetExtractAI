import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash, verify_password

async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> Optional[User]:
    """Retrieve a user by their UUID."""
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalars().first()

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Retrieve a user by their email address."""
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()

async def create_user(db: AsyncSession, user_in: UserCreate) -> User:
    """
    Create a new user.
    Hashes the password and safely handles unique constraint violations.
    """
    hashed_password = get_password_hash(user_in.password)
    db_obj = User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name
    )
    
    db.add(db_obj)
    try:
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[User]:
    """
    Authenticate a user via email and password.
    Returns the user if successful, otherwise None.
    """
    user = await get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
