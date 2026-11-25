from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ReviewBase(BaseModel):
    product_id: int
    rating: int = 5
    title: Optional[str] = ""
    comment: str


class ReviewCreate(ReviewBase):
    customer_name: Optional[str] = None


class ReviewUpdate(BaseModel):
    rating: Optional[int] = None
    title: Optional[str] = None
    comment: Optional[str] = None


class ReviewStatusUpdate(BaseModel):
    status: str  # approved, pending, hidden


class ReviewResponse(ReviewBase):
    id: int
    user_id: Optional[int] = None
    customer_name: str
    customer_avatar: str
    status: str
    verified: bool
    helpful: int
    product_name: Optional[str] = ""
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
