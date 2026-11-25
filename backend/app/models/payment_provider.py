from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class PaymentProvider(Base):
    __tablename__ = "payment_providers"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)  # ABA PayWay, KHQR / Bakong, ACLEDA
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)  # aba_payway, khqr_bakong, acleda
    description: Mapped[str] = mapped_column(String(255), default="")
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_sandbox: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    merchant_id: Mapped[str] = mapped_column(String(100), default="", nullable=False)
    api_key_masked: Mapped[str] = mapped_column(String(100), default="", nullable=False)
    webhook_secret_masked: Mapped[str] = mapped_column(String(100), default="", nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="USD", nullable=False)  # USD, KHR
    logo_url: Mapped[str] = mapped_column(String(255), default="")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
