from typing import List
import os
from fastapi import APIRouter, Depends, UploadFile, File, status, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_admin_user
from app.models.user import User
from app.schemas.backup import (
    BackupResponse,
    BackupCreateRequest,
    AutoBackupConfigResponse,
    AutoBackupConfigUpdate,
    RestoreResponse,
)
from app.services.backup_service import BackupService

router = APIRouter(prefix="/backups", tags=["Backup & Restore"])


# ==================== AUTOMATIC BACKUP CONFIG ====================
@router.get("/config", response_model=AutoBackupConfigResponse)
async def get_auto_backup_config(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    service = BackupService(db)
    cfg = await service.get_auto_config()
    return AutoBackupConfigResponse.model_validate(cfg)


@router.put("/config", response_model=AutoBackupConfigResponse)
async def update_auto_backup_config(
    req: AutoBackupConfigUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    service = BackupService(db)
    cfg = await service.update_auto_config(req)
    return AutoBackupConfigResponse.model_validate(cfg)


# ==================== BACKUPS LIST & CREATE ====================
@router.get("", response_model=List[BackupResponse])
async def list_backups(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    service = BackupService(db)
    items = await service.list_backups()
    return [BackupResponse.model_validate(b) for b in items]


@router.post("", response_model=BackupResponse, status_code=status.HTTP_201_CREATED)
async def create_backup(
    req: BackupCreateRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    service = BackupService(db)
    record = await service.create_backup(
        backup_type=req.backup_type,
        trigger_type="manual",
        created_by=admin.full_name,
    )
    return BackupResponse.model_validate(record)


# ==================== DOWNLOAD BACKUP FILE ====================
@router.get("/{backup_id}/download")
async def download_backup_file(
    backup_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    service = BackupService(db)
    rec = await service.get_backup_by_id(backup_id)
    if not os.path.exists(rec.file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Backup file not found on disk")

    return FileResponse(
        path=rec.file_path,
        filename=rec.filename,
        media_type="application/json",
    )


# ==================== RESTORE FROM BACKUP ====================
@router.post("/{backup_id}/restore", response_model=RestoreResponse)
async def restore_backup(
    backup_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    service = BackupService(db)
    result = await service.restore_backup(backup_id)
    return RestoreResponse(**result)


@router.post("/upload-restore", response_model=RestoreResponse)
async def restore_from_uploaded_file(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    content = await file.read()
    service = BackupService(db)
    result = await service.restore_from_file_bytes(content, file.filename or "upload.json")
    return RestoreResponse(**result)


# ==================== DELETE BACKUP ====================
@router.delete("/{backup_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_backup(
    backup_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    service = BackupService(db)
    await service.delete_backup(backup_id)
    return None
