from datetime import datetime, timezone
from sqlalchemy import String, Float, DateTime, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class FinancialAccount(Base):
    __tablename__ = "financial_accounts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    account_name: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g., "ABA Main Business Account"
    account_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    bank_name: Mapped[str] = mapped_column(String(100), nullable=False)  # ABA Bank, ACLEDA, Wing, Cash
    account_type: Mapped[str] = mapped_column(String(50), default="checking", nullable=False)  # checking, savings, settlement
    balance: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="USD", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    notes: Mapped[str] = mapped_column(Text, default="", nullable=False)

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


class IncomeRecord(Base):
    __tablename__ = "income_records"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(50), default="Sales", index=True, nullable=False)  # Sales, Wholesale, Sponsorship, Affiliate, Other
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="USD", nullable=False)
    date: Mapped[str] = mapped_column(String(20), nullable=False)  # YYYY-MM-DD
    reference_number: Mapped[str] = mapped_column(String(100), default="", index=True, nullable=False)
    payment_method: Mapped[str] = mapped_column(String(50), default="ABA PayWay", nullable=False)
    account_name: Mapped[str] = mapped_column(String(100), default="Main Store Account", nullable=False)
    notes: Mapped[str] = mapped_column(Text, default="", nullable=False)
    created_by: Mapped[str] = mapped_column(String(100), default="Admin", nullable=False)

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


class ExpenseRecord(Base):
    __tablename__ = "expense_records"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(50), default="Inventory", index=True, nullable=False)  # Inventory, Shipping, Marketing, Payroll, Utilities, Software, Office, Other
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="USD", nullable=False)
    date: Mapped[str] = mapped_column(String(20), nullable=False)  # YYYY-MM-DD
    payment_method: Mapped[str] = mapped_column(String(50), default="Bank Transfer", nullable=False)
    account_name: Mapped[str] = mapped_column(String(100), default="Main Store Account", nullable=False)
    receipt_url: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    notes: Mapped[str] = mapped_column(Text, default="", nullable=False)
    created_by: Mapped[str] = mapped_column(String(100), default="Admin", nullable=False)

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
