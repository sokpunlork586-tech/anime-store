from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_optional_admin_user
from app.models.user import User
from app.schemas.setting import StoreSettingSchema
from app.services.setting_service import SettingService

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("", response_model=StoreSettingSchema)
async def get_settings(db: AsyncSession = Depends(get_db)):
    service = SettingService(db)
    return await service.get_settings()


@router.put("", response_model=StoreSettingSchema)
async def update_settings(
    req: StoreSettingSchema,
    db: AsyncSession = Depends(get_db),
    admin: Optional[User] = Depends(get_optional_admin_user),
):
    service = SettingService(db)
    return await service.update_settings(req)
