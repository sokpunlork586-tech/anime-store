import logging
import pytest
import httpx
from httpx import AsyncClient
from unittest.mock import AsyncMock, MagicMock, patch
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.category import Category
from app.models.product import Product
from app.models.order import Order
from app.models.notification import Notification
from app.integrations.telegram import validate_telegram_configuration
from app.services.notification_service import NotificationService


def _mock_telegram_http(return_value=None, side_effect=None):
    """Patch only httpx.AsyncClient inside app.integrations.telegram without affecting test client."""
    mock_post = AsyncMock(return_value=return_value, side_effect=side_effect)
    mock_client = MagicMock()
    mock_client.post = mock_post
    mock_cm = MagicMock()
    mock_cm.__aenter__ = AsyncMock(return_value=mock_client)
    mock_cm.__aexit__ = AsyncMock(return_value=False)
    patcher = patch("app.integrations.telegram.httpx.AsyncClient", return_value=mock_cm)
    return patcher, mock_post


async def _seed_catalog_product(db: AsyncSession, price: float = 25.0, stock: int = 20) -> Product:
    cat = Category(
        name="Figures & Statues",
        slug="figures-statues",
        short_name="Figures",
        description="Anime figures",
        status="active",
    )
    db.add(cat)
    await db.flush()

    prod = Product(
        sku="FIG-TG-001",
        name="Luffy & Zoro <Collector> Set",
        slug="luffy-zoro-collector-set",
        series="One Piece",
        category_id=cat.id,
        price=price,
        stock_quantity=stock,
        status="active",
    )
    db.add(prod)
    await db.commit()
    await db.refresh(prod)
    return prod


def _build_order_payload(product_id: int, quantity: int = 2, price_override: float = 1.0) -> dict:
    return {
        "customer_name": "Sokha <Test>",
        "customer_email": "sokha@example.com",
        "customer_phone": "+855 12 345 678",
        "shipping_address": "Street 240, Daun Penh",
        "city": "Phnom Penh",
        "payment_method": "Cash on Delivery",
        "subtotal": price_override * quantity,
        "shipping_fee": 5.0,
        "discount": 0.0,
        "tax": 0.0,
        "total_amount": price_override * quantity + 5.0,
        "items": [
            {
                "product_id": product_id,
                "product_name": "Tampered Name",
                "price": price_override,
                "quantity": quantity,
                "variant": "Standard",
                "total": price_override * quantity,
            }
        ],
    }


@pytest.mark.asyncio
async def test_successful_order_validates_db_price_stock_and_sends_telegram(
    client: AsyncClient, db_session: AsyncSession, monkeypatch
):
    prod = await _seed_catalog_product(db_session, price=25.0, stock=15)

    monkeypatch.setattr(settings, "TELEGRAM_BOT_TOKEN", "123456:FAKE_TOKEN_FOR_TESTS")
    monkeypatch.setattr(settings, "TELEGRAM_CHAT_ID", "999999999")
    monkeypatch.setattr(settings, "TELEGRAM_ENABLED", True)

    mock_response = httpx.Response(
        200,
        json={"ok": True, "result": {"message_id": 101}},
        request=httpx.Request("POST", "https://api.telegram.org/bot123456/sendMessage"),
    )

    patcher, mock_post = _mock_telegram_http(return_value=mock_response)
    with patcher:
        # Send tampered client price (1.0) -> backend must enforce DB price (25.0)
        res = await client.post("/api/v1/orders", json=_build_order_payload(prod.id, quantity=2, price_override=1.0))

    assert res.status_code == 201
    data = res.json()
    assert data["subtotal"] == 50.0
    assert data["shipping_fee"] == 5.0
    assert data["total_amount"] == 55.0
    assert data["status"] == "Pending"

    # Stock decremented safely in DB
    await db_session.refresh(prod)
    assert prod.stock_quantity == 13

    # Telegram API called once with escaped HTML and real DB order data
    assert mock_post.await_count == 1
    sent_json = mock_post.await_args.kwargs["json"]
    assert sent_json["chat_id"] == "999999999"
    assert sent_json["parse_mode"] == "HTML"
    msg = sent_json["text"]
    assert "🎉 <b>NEW ORDER RECEIVED!</b>" in msg
    assert data["order_number"] in msg
    assert "Sokha &lt;Test&gt;" in msg
    assert "Luffy &amp; Zoro &lt;Collector&gt; Set × 2" in msg
    assert "$50.00" in msg
    assert "$5.00" in msg
    assert "$55.00" in msg
    assert "Cash on Delivery" in msg
    assert "ANIME STORE" in msg

    # Notification stored in outbox as sent
    notif = (
        await db_session.execute(select(Notification).where(Notification.order_id == data["id"]))
    ).scalar_one()
    assert notif.telegram_sent is True
    assert notif.status == "sent"
    assert notif.attempts == 1


@pytest.mark.asyncio
async def test_insufficient_stock_rejects_order_and_does_not_notify(
    client: AsyncClient, db_session: AsyncSession, monkeypatch
):
    prod = await _seed_catalog_product(db_session, price=30.0, stock=1)

    monkeypatch.setattr(settings, "TELEGRAM_BOT_TOKEN", "123456:FAKE_TOKEN_FOR_TESTS")
    monkeypatch.setattr(settings, "TELEGRAM_CHAT_ID", "999999999")
    monkeypatch.setattr(settings, "TELEGRAM_ENABLED", True)

    patcher, mock_post = _mock_telegram_http()
    with patcher:
        res = await client.post("/api/v1/orders", json=_build_order_payload(prod.id, quantity=5, price_override=30.0))

    assert res.status_code == 400
    assert "Insufficient stock" in res.json()["detail"]
    assert mock_post.await_count == 0


@pytest.mark.asyncio
async def test_invalid_telegram_credentials_still_saves_order_and_never_logs_token(
    client: AsyncClient, db_session: AsyncSession, monkeypatch, caplog
):
    prod = await _seed_catalog_product(db_session, price=20.0, stock=15)
    secret_token = "999888:SECRET_BOT_TOKEN_DO_NOT_LOG"

    monkeypatch.setattr(settings, "TELEGRAM_BOT_TOKEN", secret_token)
    monkeypatch.setattr(settings, "TELEGRAM_CHAT_ID", "bad-chat-id")
    monkeypatch.setattr(settings, "TELEGRAM_ENABLED", True)

    mock_401 = httpx.Response(
        401,
        json={"ok": False, "description": "Unauthorized"},
        request=httpx.Request("POST", f"https://api.telegram.org/bot{secret_token}/sendMessage"),
    )

    patcher, _ = _mock_telegram_http(return_value=mock_401)
    with caplog.at_level(logging.INFO):
        with patcher:
            res = await client.post("/api/v1/orders", json=_build_order_payload(prod.id, quantity=1, price_override=20.0))

    assert res.status_code == 201
    order_id = res.json()["id"]

    # Order exists in DB despite invalid Telegram credentials
    saved_order = (await db_session.execute(select(Order).where(Order.id == order_id))).scalar_one_or_none()
    assert saved_order is not None

    # Failed notification captured in outbox
    notif = (await db_session.execute(select(Notification).where(Notification.order_id == order_id))).scalar_one()
    assert notif.telegram_sent is False
    assert notif.status == "failed"
    assert "401" in notif.last_error

    # Bot token must never appear in logs
    assert secret_token not in caplog.text


@pytest.mark.asyncio
async def test_telegram_unavailable_and_outbox_retry_recovery(
    client: AsyncClient, db_session: AsyncSession, monkeypatch
):
    prod = await _seed_catalog_product(db_session, price=40.0, stock=20)

    monkeypatch.setattr(settings, "TELEGRAM_BOT_TOKEN", "123456:FAKE_TOKEN_FOR_TESTS")
    monkeypatch.setattr(settings, "TELEGRAM_CHAT_ID", "999999999")
    monkeypatch.setattr(settings, "TELEGRAM_ENABLED", True)

    # 1. Simulate network timeout when placing order
    patcher_fail, _ = _mock_telegram_http(side_effect=httpx.TimeoutException("Timed out"))
    with patcher_fail:
        res = await client.post("/api/v1/orders", json=_build_order_payload(prod.id, quantity=1, price_override=40.0))

    assert res.status_code == 201
    order_id = res.json()["id"]

    # Order and decremented stock persisted in DB
    await db_session.refresh(prod)
    assert prod.stock_quantity == 19

    notif = (await db_session.execute(select(Notification).where(Notification.order_id == order_id))).scalar_one()
    assert notif.status == "failed"
    assert notif.telegram_sent is False
    assert notif.attempts == 1

    # 2. Simulate Telegram recovery and run outbox retry endpoint
    ok_resp = httpx.Response(
        200,
        json={"ok": True, "result": {"message_id": 202}},
        request=httpx.Request("POST", "https://api.telegram.org/bot123456/sendMessage"),
    )
    patcher_ok, _ = _mock_telegram_http(return_value=ok_resp)
    with patcher_ok:
        retry_res = await client.post("/api/v1/notifications/retry-failed")

    assert retry_res.status_code == 200
    assert retry_res.json() == {"retried": 1, "sent": 1, "failed": 0}

    await db_session.refresh(notif)
    assert notif.status == "sent"
    assert notif.telegram_sent is True
    assert notif.attempts == 2


@pytest.mark.asyncio
async def test_duplicate_notification_prevention(
    client: AsyncClient, db_session: AsyncSession, monkeypatch
):
    prod = await _seed_catalog_product(db_session, price=15.0, stock=20)

    monkeypatch.setattr(settings, "TELEGRAM_BOT_TOKEN", "123456:FAKE_TOKEN_FOR_TESTS")
    monkeypatch.setattr(settings, "TELEGRAM_CHAT_ID", "999999999")
    monkeypatch.setattr(settings, "TELEGRAM_ENABLED", True)

    ok_resp = httpx.Response(
        200,
        json={"ok": True, "result": {"message_id": 303}},
        request=httpx.Request("POST", "https://api.telegram.org/bot123456/sendMessage"),
    )

    patcher, mock_post = _mock_telegram_http(return_value=ok_resp)
    with patcher:
        res = await client.post("/api/v1/orders", json=_build_order_payload(prod.id, quantity=1, price_override=15.0))
        assert res.status_code == 201
        order_id = res.json()["id"]

        # Attempt to trigger notification a second time for the exact same order
        order_obj = (await db_session.execute(select(Order).where(Order.id == order_id))).scalar_one()
        await NotificationService(db_session).notify_new_order(order_obj)

    # Telegram API must only have been called once
    assert mock_post.await_count == 1
    notifs = (await db_session.execute(select(Notification).where(Notification.order_id == order_id))).scalars().all()
    assert len(notifs) == 1


@pytest.mark.asyncio
async def test_missing_config_validation(monkeypatch):
    monkeypatch.setattr(settings, "TELEGRAM_ENABLED", False)
    ok, reason = validate_telegram_configuration()
    assert ok is False
    assert "disabled" in reason.lower()

    monkeypatch.setattr(settings, "TELEGRAM_ENABLED", True)
    monkeypatch.setattr(settings, "TELEGRAM_BOT_TOKEN", "")
    ok, reason = validate_telegram_configuration()
    assert ok is False
    assert "missing" in reason.lower()
