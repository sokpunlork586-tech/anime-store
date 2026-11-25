from typing import Optional, Dict
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class BackupCreateRequest(BaseModel):
    backup_type: str = "full"  # full, catalog, orders_financial, users
    notes: Optional[str] = ""


class BackupResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    backup_type: str
    file_size_bytes: int
    trigger_type: str
    status: str
    checksum_sha256: str
    record_counts_json: str
    created_by: str
    created_at: datetime


class AutoBackupConfigResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    is_enabled: bool
    frequency: str  # daily, weekly, monthly
    backup_time: str
    retention_days: int
    storage_target: str
    last_run_at: Optional[datetime] = None
    next_run_at: Optional[datetime] = None
    updated_at: datetime


class AutoBackupConfigUpdate(BaseModel):
    is_enabled: Optional[bool] = None
    frequency: Optional[str] = None
    backup_time: Optional[str] = None
    retention_days: Optional[int] = None
    storage_target: Optional[str] = None


class RestoreResponse(BaseModel):
    success: bool
    message: str
    restored_counts: Dict[str, int]
    timestamp: datetime
