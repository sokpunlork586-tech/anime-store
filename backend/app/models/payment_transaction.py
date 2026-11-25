from datetime import datetime, timezone
from sqlalchemy import String, Float, DateTime, Text, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    transaction_id: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    order_id: Mapped[int] = mapped_column(Integer, index=True, nullable=True)
    order_number: Mapped[str] = mapped_column(String(50), default="", index=True, nullable=False)
    provider_code: Mapped[str] = mapped_column(String(50), index=True, nullable=False)  # aba_payway, khqr_bakong, acleda
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="USD", nullable=False)
    # PENDING, PROCESSING, PAID, FAILED, CANCELLED, EXPIRED, REFUNDED
    status: Mapped[str] = mapped_column(String(30), default="PENDING", index=True, nullable=False)
    payment_method: Mapped[str] = mapped_column(String(50), default="", nullable=False)  # QR, Card, Account
    customer_name: Mapped[str] = mapped_column(String(150), default="", nullable=False)
    customer_email: Mapped[str] = mapped_column(String(150), default="", nullable=False)
    notes: Mapped[str] = mapped_column(Text, default="", nullable=False)
    raw_response: Mapped[str] = mapped_column(Text, default="", nullable=False)
    signature: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    refund_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    refund_reason: Mapped[str] = mapped_column(String(255), default="", nullable=False)

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
