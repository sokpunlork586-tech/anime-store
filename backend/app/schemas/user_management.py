from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class RoleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    display_name: str
    description: str


class PermissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    code: str
    name: str
    module: str
    description: str


class UserCreateAdmin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    role: str = "staff"  # super_admin, admin, staff, customer
    phone: Optional[str] = ""
    address: Optional[str] = ""
    city: Optional[str] = ""
    is_active: bool = True
    permissions: Optional[List[str]] = []


class UserUpdateAdmin(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    is_active: Optional[bool] = None
    permissions: Optional[List[str]] = None


class PasswordResetRequest(BaseModel):
    new_password: str = Field(..., min_length=6)


class ActivityLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: Optional[int]
    user_email: str
    user_name: str
    action: str
    module: str
    details: str
    ip_address: str
    created_at: datetime
