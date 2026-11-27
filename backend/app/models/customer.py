from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Integer, Float, Boolean, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(50), default="", nullable=False)
    avatar: Mapped[str] = mapped_column(Text, default="", nullable=False)
    address: Mapped[str] = mapped_column(String(500), default="", nullable=False)
    city: Mapped[str] = mapped_column(String(100), default="", nullable=False)
    country: Mapped[str] = mapped_column(String(100), default="Cambodia", nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="active", nullable=False, index=True)
    club_member: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    total_orders: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_spent: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    last_order_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
