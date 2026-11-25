from datetime import datetime, timezone
from sqlalchemy import String, Integer, BigInteger, DateTime, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class BackupRecord(Base):
    __tablename__ = "backup_records"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    filename: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    backup_type: Mapped[str] = mapped_column(String(50), default="full", nullable=False)  # full, catalog, orders_financial, users
    file_size_bytes: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    trigger_type: Mapped[str] = mapped_column(String(30), default="manual", nullable=False)  # automatic, manual
    status: Mapped[str] = mapped_column(String(30), default="completed", nullable=False)  # completed, failed
    checksum_sha256: Mapped[str] = mapped_column(String(64), default="", nullable=False)
    record_counts_json: Mapped[str] = mapped_column(Text, default="{}", nullable=False)
    created_by: Mapped[str] = mapped_column(String(100), default="Admin", nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class AutoBackupConfigModel(Base):
    __tablename__ = "auto_backup_config"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    frequency: Mapped[str] = mapped_column(String(30), default="daily", nullable=False)  # daily, weekly, monthly
    backup_time: Mapped[str] = mapped_column(String(10), default="02:00", nullable=False)  # HH:MM
    retention_days: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    storage_target: Mapped[str] = mapped_column(String(50), default="local_storage", nullable=False)

    last_run_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=True,
    )
    next_run_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=True,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
