from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_optional_admin_user
from app.models.user import User
from app.schemas.notification import (
    NotificationCreate,
    NotificationListResponse,
    NotificationResponse,
    TelegramTestRequest,
)
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=NotificationListResponse)
async def list_notifications(
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    admin: Optional[User] = Depends(get_optional_admin_user),
):
    service = NotificationService(db)
    items, unread_count = await service.list_notifications(limit=limit)
    return NotificationListResponse(
        items=[NotificationResponse.model_validate(n) for n in items],
        unread_count=unread_count,
        telegram_configured=NotificationService.is_telegram_configured(),
    )


@router.post("", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
async def create_notification(
    req: NotificationCreate,
    db: AsyncSession = Depends(get_db),
    admin: Optional[User] = Depends(get_optional_admin_user),
):
    service = NotificationService(db)
    notif, _ = await service.create_notification(
        title=req.title,
        message=req.message,
        notif_type=req.type,
        send_telegram=req.send_telegram,
    )
    return NotificationResponse.model_validate(notif)


@router.post("/test-telegram")
async def test_telegram_notification(
    req: Optional[TelegramTestRequest] = None,
    db: AsyncSession = Depends(get_db),
    admin: Optional[User] = Depends(get_optional_admin_user),
):
    service = NotificationService(db)
    custom_msg = req.message.strip() if req and req.message else None
    msg = custom_msg or "Telegram notifications are connected to Anime Store Admin Dashboard!"
    notif, detail = await service.create_notification(
        title="Telegram Test Notification",
        message=msg,
        notif_type="system",
        send_telegram=True,
        telegram_text=f"🔔 <b>Anime Store Notification Test</b>\n{msg}",
    )
    return {
        "sent": notif.telegram_sent,
        "detail": detail,
        "notification": NotificationResponse.model_validate(notif),
    }


@router.put("/read-all")
async def mark_all_notifications_read(
    db: AsyncSession = Depends(get_db),
    admin: Optional[User] = Depends(get_optional_admin_user),
):
    service = NotificationService(db)
    updated = await service.mark_all_read()
    return {"updated": updated}


@router.post("/retry-failed")
async def retry_failed_notifications(
    max_attempts: int = Query(5, ge=1, le=20),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    admin: Optional[User] = Depends(get_optional_admin_user),
):
    service = NotificationService(db)
    return await service.retry_failed_notifications(max_attempts=max_attempts, limit=limit)


@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_read(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    admin: Optional[User] = Depends(get_optional_admin_user),
):
    service = NotificationService(db)
    notif = await service.mark_read(notification_id)
    return NotificationResponse.model_validate(notif)


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    admin: Optional[User] = Depends(get_optional_admin_user),
):
    service = NotificationService(db)
    await service.delete_notification(notification_id)
    return {"deleted": True, "id": notification_id}
