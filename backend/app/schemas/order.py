from datetime import datetime
from typing import Optional, List, Union
from pydantic import BaseModel, ConfigDict, Field


class OrderItemBase(BaseModel):
    product_id: Optional[Union[int, str]] = None
    product_name: str
    series: Optional[str] = ""
    image_url: Optional[str] = ""
    price: float
    quantity: int
    variant: Optional[str] = ""
    total: float


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemResponse(OrderItemBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: Optional[str] = ""
    shipping_address: str
    city: Optional[str] = ""
    payment_method: Optional[str] = "Credit Card"
    items: List[OrderItemCreate]
    subtotal: float
    shipping_fee: Optional[float] = 0.0
    discount: Optional[float] = 0.0
    tax: Optional[float] = 0.0
    total_amount: float
    notes: Optional[str] = ""


class OrderUpdateStatus(BaseModel):
    status: str  # Pending, Processing, Shipped, Completed, Cancelled
    payment_status: Optional[str] = None


class OrderBulkDeleteRequest(BaseModel):
    ids: List[int] = Field(..., min_length=1)


class OrderResponse(BaseModel):
    id: int
    order_number: str
    user_id: Optional[int] = None
    customer_name: str
    customer_email: str
    customer_phone: str
    shipping_address: str
    city: str
    payment_method: str
    subtotal: float
    shipping_fee: float
    discount: float
    tax: float
    total_amount: float
    status: str
    payment_status: str
    notes: str
    items: List[OrderItemResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
