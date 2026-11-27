import html
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy import select, func, desc, update, inspect as sa_inspect
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.integrations.telegram import (
    validate_telegram_configuration,
    send_message as telegram_send_message,
    format_order_notification,
)
from app.models.notification import Notification
from app.models.order import Order
from app.models.product import Product

logger = logging.getLogger("anime_store.notifications")


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    @staticmethod
    def is_telegram_configured() -> bool:
        ok, _ = validate_telegram_configuration()
        return ok

    @staticmethod
    async def send_telegram_message(text: str) -> Tuple[bool, str]:
        return await telegram_send_message(text)

    async def create_notification(
        self,
        title: str,
        message: str,
        notif_type: str = "system",
        send_telegram: bool = True,
        telegram_text: Optional[str] = None,
        order_id: Optional[int] = None,
        event_key: Optional[str] = None,
    ) -> Tuple[Notification, str]:
        # Duplicate prevention via unique event_key
        if event_key:
            existing_res = await self.db.execute(
                select(Notification).where(Notification.event_key == event_key)
            )
            existing = existing_res.scalar_one_or_none()
            if existing:
                if existing.telegram_sent or existing.status == "sent":
                    logger.info("Duplicate notification skipped for event_key=%s", event_key)
                    return existing, "Duplicate notification skipped (already sent)."
                # Retry existing unsent outbox entry instead of inserting a duplicate
                if send_telegram:
                    payload = telegram_text or existing.payload_html or (
                        f"<b>{html.escape(title)}</b>\n{html.escape(message)}"
                    )
                    existing.payload_html = payload
                    sent, detail = await telegram_send_message(payload)
                    existing.attempts += 1
                    if sent:
                        existing.telegram_sent = True
                        existing.status = "sent"
                        existing.last_error = ""
                        existing.sent_at = datetime.now(timezone.utc)
                    else:
                        existing.status = "failed"
                        existing.last_error = detail
                    await self.db.flush()
                    await self.db.refresh(existing)
                    return existing, detail
                return existing, "Existing notification retained."

        payload = telegram_text or f"<b>{html.escape(title)}</b>\n{html.escape(message)}"
        telegram_sent = False
        detail = ""
        notif_status = "pending"
        attempts = 0
        last_error = ""
        sent_at = None

        if send_telegram:
            attempts = 1
            telegram_sent, detail = await telegram_send_message(payload)
            if telegram_sent:
                notif_status = "sent"
                sent_at = datetime.now(timezone.utc)
            else:
                notif_status = "failed"
                last_error = detail

        notif = Notification(
            order_id=order_id,
            event_key=event_key,
            title=title,
            message=message,
            type=notif_type,
            read=False,
            telegram_sent=telegram_sent,
            status=notif_status,
            attempts=attempts,
            last_error=last_error,
            payload_html=payload if send_telegram else "",
            sent_at=sent_at,
        )
        self.db.add(notif)
        await self.db.flush()
        await self.db.refresh(notif)
        return notif, detail

    async def notify_new_order(self, order: Order) -> Notification:
        event_key = f"order_created:{order.id}"
        existing_res = await self.db.execute(
            select(Notification).where(Notification.event_key == event_key)
        )
        existing = existing_res.scalar_one_or_none()
        if existing and (existing.telegram_sent or existing.status == "sent"):
            logger.info("Duplicate notification skipped for event_key=%s", event_key)
            return existing

        # Ensure order.items is loaded safely in async SQLAlchemy
        if "items" in sa_inspect(order).unloaded:
            loaded_res = await self.db.execute(
                select(Order).options(selectinload(Order.items)).where(Order.id == order.id)
            )
            order = loaded_res.scalar_one()

        title = f"New Order {order.order_number}"
        message = (
            f"{order.customer_name} ordered ${float(order.total_amount):,.2f} "
            f"({len(order.items or [])} item(s)) via {order.payment_method}"
        )
        telegram_text = format_order_notification(order)

        notif, _ = await self.create_notification(
            title=title,
            message=message,
            notif_type="order",
            send_telegram=True,
            telegram_text=telegram_text,
            order_id=order.id,
            event_key=event_key,
        )
        return notif

    async def notify_order_status_change(self, order: Order, old_status: str) -> Notification:
        title = f"Order {order.order_number} {order.status}"
        message = f"Status changed from {old_status} to {order.status} for {order.customer_name}."
        telegram_text = (
            f"📦 <b>Order Status Updated: {html.escape(order.order_number)}</b>\n"
            f"👤 <b>Customer:</b> {html.escape(order.customer_name)}\n"
            f"🔄 <b>Status:</b> {html.escape(old_status)} → <b>{html.escape(order.status)}</b>\n"
            f"💰 <b>Total:</b> ${float(order.total_amount):,.2f}"
        )
        notif, _ = await self.create_notification(
            title=title,
            message=message,
            notif_type="order",
            send_telegram=True,
            telegram_text=telegram_text,
            order_id=order.id,
        )
        return notif

    async def notify_low_stock(self, product: Product, new_stock: int) -> Notification:
        is_out = new_stock <= 0
        title = f"Out of Stock: {product.name}" if is_out else f"Low Stock Alert: {product.name}"
        message = (
            f"{product.name} ({product.sku}) is now out of stock."
            if is_out
            else f"{product.name} ({product.sku}) has only {new_stock} unit(s) remaining."
        )
        icon = "🚨" if is_out else "⚠️"
        telegram_text = (
            f"{icon} <b>{html.escape(title)}</b>\n"
            f"📦 <b>SKU:</b> {html.escape(product.sku)}\n"
            f"🔢 <b>Remaining Stock:</b> {new_stock} unit(s)"
        )
        notif, _ = await self.create_notification(
            title=title,
            message=message,
            notif_type="inventory",
            send_telegram=True,
            telegram_text=telegram_text,
        )
        return notif

    async def retry_failed_notifications(
        self, max_attempts: int = 5, limit: int = 20
    ) -> Dict[str, int]:
        """Retry failed/pending outbox notifications that have not yet been delivered to Telegram."""
        stmt = (
            select(Notification)
            .where(
                Notification.telegram_sent == False,  # noqa: E712
                Notification.status.in_(["pending", "failed"]),
                Notification.attempts < max_attempts,
                Notification.payload_html != "",
            )
            .order_by(Notification.created_at.asc())
            .limit(limit)
        )
        rows = list((await self.db.execute(stmt)).scalars().all())
        retried = len(rows)
        sent_count = 0
        failed_count = 0

        for notif in rows:
            ok, detail = await telegram_send_message(notif.payload_html)
            notif.attempts += 1
            if ok:
                notif.telegram_sent = True
                notif.status = "sent"
                notif.last_error = ""
                notif.sent_at = datetime.now(timezone.utc)
                sent_count += 1
            else:
                notif.status = "failed"
                notif.last_error = detail
                failed_count += 1

        await self.db.flush()
        return {"retried": retried, "sent": sent_count, "failed": failed_count}

    async def list_notifications(self, limit: int = 50) -> Tuple[List[Notification], int]:
        stmt = select(Notification).order_by(desc(Notification.created_at), desc(Notification.id)).limit(limit)
        items = list((await self.db.execute(stmt)).scalars().all())
        unread_stmt = select(func.count(Notification.id)).where(Notification.read == False)  # noqa: E712
        unread_count = (await self.db.execute(unread_stmt)).scalar() or 0
        return items, unread_count

    async def mark_read(self, notification_id: int) -> Notification:
        res = await self.db.execute(select(Notification).where(Notification.id == notification_id))
        notif = res.scalar_one_or_none()
        if not notif:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
        notif.read = True
        await self.db.flush()
        await self.db.refresh(notif)
        return notif

    async def mark_all_read(self) -> int:
        res = await self.db.execute(
            update(Notification).where(Notification.read == False).values(read=True)  # noqa: E712
        )
        await self.db.flush()
        return res.rowcount or 0

    async def delete_notification(self, notification_id: int) -> None:
        res = await self.db.execute(select(Notification).where(Notification.id == notification_id))
        notif = res.scalar_one_or_none()
        if not notif:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
        await self.db.delete(notif)
        await self.db.flush()
