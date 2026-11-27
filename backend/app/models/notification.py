from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Text, Boolean, DateTime, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    order_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("orders.id", ondelete="SET NULL"), nullable=True, index=True
    )
    event_key: Mapped[Optional[str]] = mapped_column(
        String(120), unique=True, nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[str] = mapped_column(String(30), default="system", nullable=False, index=True)
    read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    telegram_sent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False, index=True)
    attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_error: Mapped[str] = mapped_column(Text, default="", nullable=False)
    payload_html: Mapped[str] = mapped_column(Text, default="", nullable=False)
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
