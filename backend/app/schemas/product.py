from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, ConfigDict


class ProductImageResponse(BaseModel):
    id: int
    image_url: str
    is_primary: bool
    display_order: int

    model_config = ConfigDict(from_attributes=True)


class ProductBase(BaseModel):
    sku: str
    name: str
    slug: str
    series: Optional[str] = ""
    category_id: int
    price: float
    original_price: Optional[float] = None
    rating: Optional[float] = 0.0
    review_count: Optional[int] = 0
    units_sold: Optional[int] = 0
    image_url: Optional[str] = ""
    badge: Optional[str] = None
    featured: Optional[bool] = False
    is_new_arrival: Optional[bool] = False
    stock_quantity: Optional[int] = 0
    status: Optional[str] = "active"
    description: Optional[str] = ""
    specifications: Optional[Dict[str, str]] = {}
    variants: Optional[List[str]] = []
    tags: Optional[List[str]] = []


class ProductCreate(ProductBase):
    images: Optional[List[str]] = []


class ProductUpdate(BaseModel):
    sku: Optional[str] = None
    name: Optional[str] = None
    slug: Optional[str] = None
    series: Optional[str] = None
    category_id: Optional[int] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    rating: Optional[float] = None
    review_count: Optional[int] = None
    units_sold: Optional[int] = None
    image_url: Optional[str] = None
    badge: Optional[str] = None
    featured: Optional[bool] = None
    is_new_arrival: Optional[bool] = None
    stock_quantity: Optional[int] = None
    status: Optional[str] = None
    description: Optional[str] = None
    specifications: Optional[Dict[str, str]] = None
    variants: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    images: Optional[List[str]] = None


class ProductResponse(ProductBase):
    id: int
    category_name: Optional[str] = ""
    images: List[ProductImageResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
