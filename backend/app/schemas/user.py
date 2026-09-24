from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters long")

# Properties to receive via API on update
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8)

# Properties shared by models stored in DB
class UserInDBBase(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

# Properties to return to client
class UserResponse(UserInDBBase):
    pass

# Properties properties stored in DB
class UserInDB(UserInDBBase):
    hashed_password: str
