from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.product import ProductResponse


class WishlistCreate(BaseModel):
    product_id: int


class WishlistResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    product: Optional[ProductResponse] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
