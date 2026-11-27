import html
import logging
from typing import Optional, Tuple
import httpx
from app.core.config import settings
from app.models.order import Order

logger = logging.getLogger("anime_store.telegram")

TELEGRAM_API_BASE = "https://api.telegram.org"


def validate_telegram_configuration() -> Tuple[bool, str]:
    """Validate Telegram notification settings without exposing secret values."""
    if not settings.TELEGRAM_ENABLED:
        return False, "Telegram notifications are disabled (TELEGRAM_ENABLED=false)."

    token = (settings.TELEGRAM_BOT_TOKEN or "").strip()
    chat_id = (settings.TELEGRAM_CHAT_ID or "").strip()

    if not token:
        return False, "TELEGRAM_BOT_TOKEN is missing."
    if ":" not in token or token == "your_bot_token":
        return False, "TELEGRAM_BOT_TOKEN format is invalid."
    if not chat_id or chat_id == "your_admin_chat_id":
        return False, "TELEGRAM_CHAT_ID is missing."

    return True, "Telegram configuration is valid."


def handle_telegram_errors(
    error: Optional[Exception] = None,
    response: Optional[httpx.Response] = None,
    context: str = "sendMessage",
) -> Tuple[bool, str]:
    """Normalize Telegram API/network errors and log safely without exposing tokens or PII."""
    if response is not None:
        status_code = response.status_code
        description = ""
        try:
            payload = response.json()
            if isinstance(payload, dict):
                description = str(payload.get("description") or "")
        except Exception:
            description = ""

        if status_code == 401:
            msg = "Invalid Telegram Bot Token (401 Unauthorized)."
        elif status_code == 400:
            msg = f"Invalid Telegram request or Chat ID (400): {description or 'Bad Request'}"
        elif status_code == 403:
            msg = "Telegram bot was blocked by recipient or lacks permissions (403 Forbidden)."
        elif status_code == 429:
            msg = "Telegram rate limit exceeded (429 Too Many Requests)."
        elif status_code >= 500:
            msg = f"Telegram service temporarily unavailable (HTTP {status_code})."
        else:
            msg = f"Telegram API error (HTTP {status_code}): {description or 'Unexpected response'}"

        logger.warning("Telegram %s failed: %s", context, msg)
        return False, msg

    if isinstance(error, httpx.TimeoutException):
        msg = "Telegram request timed out."
        logger.warning("Telegram %s failed: %s", context, msg)
        return False, msg

    if isinstance(error, httpx.RequestError):
        msg = f"Telegram network error ({type(error).__name__})."
        logger.warning("Telegram %s failed: %s", context, msg)
        return False, msg

    msg = f"Unexpected Telegram error ({type(error).__name__ if error else 'Unknown'})."
    logger.warning("Telegram %s failed: %s", context, msg)
    return False, msg


async def send_message(
    text: str,
    chat_id: Optional[str] = None,
    timeout: float = 8.0,
) -> Tuple[bool, str]:
    """Send an HTML-formatted message via Telegram Bot API sendMessage."""
    is_valid, reason = validate_telegram_configuration()
    if not is_valid:
        logger.info("Skipping Telegram send: %s", reason)
        return False, reason

    token = (settings.TELEGRAM_BOT_TOKEN or "").strip()
    target_chat_id = (chat_id or settings.TELEGRAM_CHAT_ID or "").strip()
    url = f"{TELEGRAM_API_BASE}/bot{token}/sendMessage"
    payload = {
        "chat_id": target_chat_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    }

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=payload)

        if response.status_code == 200:
            try:
                data = response.json()
            except Exception:
                data = {}
            if isinstance(data, dict) and data.get("ok"):
                logger.info("Telegram notification delivered successfully.")
                return True, "Telegram notification sent."
            return handle_telegram_errors(response=response, context="sendMessage")

        return handle_telegram_errors(response=response, context="sendMessage")
    except Exception as exc:
        return handle_telegram_errors(error=exc, context="sendMessage")


def format_order_notification(order: Order) -> str:
    """Build an HTML-escaped Telegram notification message from actual database Order data."""
    items = list(getattr(order, "items", []) or [])
    if items:
        items_block = "\n".join(
            f"- {html.escape(str(item.product_name))} × {int(item.quantity)}"
            for item in items
        )
    else:
        items_block = "- (No items)"

    store_name = html.escape("ANIME STORE")
    order_id_str = html.escape(str(order.order_number))
    customer_name = html.escape(str(order.customer_name))
    customer_email = html.escape(str(order.customer_email))
    payment_method = html.escape(str(order.payment_method or "Cash on Delivery"))
    order_status = html.escape(str(order.status or "Pending"))

    return (
        f"🎉 <b>NEW ORDER RECEIVED!</b>\n\n"
        f"🆔 <b>Order ID:</b> {order_id_str}\n\n"
        f"👤 <b>Customer:</b> {customer_name}\n\n"
        f"📧 <b>Email:</b> {customer_email}\n\n"
        f"📦 <b>Order Items:</b>\n"
        f"{items_block}\n\n"
        f"💰 <b>Subtotal:</b> ${float(order.subtotal):,.2f}\n"
        f"🚚 <b>Shipping:</b> ${float(order.shipping_fee):,.2f}\n"
        f"💵 <b>Total:</b> ${float(order.total_amount):,.2f}\n\n"
        f"💳 <b>Payment Method:</b> {payment_method}\n\n"
        f"📌 <b>Order Status:</b> {order_status}\n\n"
        f"🏪 <b>{store_name}</b>"
    )


async def send_order_notification(order: Order, timeout: float = 8.0) -> Tuple[bool, str]:
    """Format and send an order confirmation notification to the Admin Telegram chat."""
    is_valid, reason = validate_telegram_configuration()
    if not is_valid:
        logger.info("Order %s Telegram notification skipped: %s", order.order_number, reason)
        return False, reason

    message_html = format_order_notification(order)
    return await send_message(message_html, timeout=timeout)
