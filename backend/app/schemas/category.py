from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class CategoryBase(BaseModel):
    name: str
    slug: str
    short_name: Optional[str] = ""
    description: Optional[str] = ""
    image: Optional[str] = ""
    icon_key: Optional[str] = "Package"
    accent_bg: Optional[str] = "#FFF0E6"
    status: Optional[str] = "active"


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    short_name: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    icon_key: Optional[str] = None
    accent_bg: Optional[str] = None
    status: Optional[str] = None


class CategoryResponse(CategoryBase):
    id: int
    product_count: Optional[int] = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
