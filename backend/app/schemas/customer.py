from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict, Field


class CustomerBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone: str = ""
    avatar: str = ""
    address: str = ""
    city: str = ""
    country: str = "Cambodia"
    status: str = "active"
    club_member: bool = False


class CustomerCreate(CustomerBase):
    total_orders: int = 0
    total_spent: float = 0.0


class CustomerUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    status: Optional[str] = None
    club_member: Optional[bool] = None
    total_orders: Optional[int] = None
    total_spent: Optional[float] = None


class CustomerBulkDeleteRequest(BaseModel):
    ids: List[int] = Field(..., min_length=1)


class CustomerResponse(CustomerBase):
    id: int
    total_orders: int
    total_spent: float
    joined_at: datetime
    last_order_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
