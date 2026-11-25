from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class PaymentProviderBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = ""
    is_enabled: bool = True
    is_sandbox: bool = True
    merchant_id: str
    api_key_masked: Optional[str] = ""
    webhook_secret_masked: Optional[str] = ""
    currency: str = "USD"
    logo_url: Optional[str] = ""


class PaymentProviderUpdate(BaseModel):
    is_enabled: Optional[bool] = None
    is_sandbox: Optional[bool] = None
    merchant_id: Optional[str] = None
    api_key: Optional[str] = None
    webhook_secret: Optional[str] = None
    currency: Optional[str] = None


class PaymentProviderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    code: str
    description: str
    is_enabled: bool
    is_sandbox: bool
    merchant_id: str
    api_key_masked: str
    webhook_secret_masked: str
    currency: str
    logo_url: str
    created_at: datetime
    updated_at: datetime


class PaymentTransactionCreate(BaseModel):
    order_id: Optional[int] = None
    order_number: str
    provider_code: str
    amount: float
    currency: str = "USD"
    payment_method: str = "QR"
    customer_name: str
    customer_email: str
    notes: Optional[str] = ""


class PaymentTransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    transaction_id: str
    order_id: Optional[int]
    order_number: str
    provider_code: str
    amount: float
    currency: str
    status: str
    payment_method: str
    customer_name: str
    customer_email: str
    notes: str
    refund_amount: float
    refund_reason: str
    created_at: datetime
    updated_at: datetime


class PaymentVerifyRequest(BaseModel):
    transaction_id: str
    provider_code: str
    signature: Optional[str] = ""


class PaymentVerifyResponse(BaseModel):
    verified: bool
    transaction_id: str
    status: str
    amount: float
    currency: str
    message: str


class RefundRequest(BaseModel):
    refund_amount: float
    reason: str


class WebhookPayload(BaseModel):
    transaction_id: str
    provider_code: str
    amount: float
    currency: str = "USD"
    status: str
    signature: str
    timestamp: Optional[int] = None
