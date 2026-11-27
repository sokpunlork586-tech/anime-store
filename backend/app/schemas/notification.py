from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class NotificationCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    message: str = Field(..., min_length=1)
    type: str = "system"
    send_telegram: bool = True


class NotificationResponse(BaseModel):
    id: int
    order_id: Optional[int] = None
    event_key: Optional[str] = None
    title: str
    message: str
    type: str
    read: bool
    telegram_sent: bool
    status: str
    attempts: int
    last_error: str
    sent_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NotificationListResponse(BaseModel):
    items: List[NotificationResponse]
    unread_count: int
    telegram_configured: bool


class TelegramTestRequest(BaseModel):
    message: Optional[str] = None
