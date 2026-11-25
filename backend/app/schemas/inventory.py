from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class InventoryResponse(BaseModel):
    id: int
    product_id: int
    product_name: str = ""
    sku: str = ""
    category: str = ""
    current_stock: int
    min_stock: int
    max_stock: int
    status: str
    last_restocked: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StockAdjustmentRequest(BaseModel):
    product_id: int
    type: str  # in, out
    quantity: int
    reason: Optional[str] = "Stock adjustment"


class InventoryTransactionResponse(BaseModel):
    id: int
    product_id: int
    product_name: str = ""
    type: str
    quantity: int
    previous_stock: int
    new_stock: int
    reason: str
    created_by: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
