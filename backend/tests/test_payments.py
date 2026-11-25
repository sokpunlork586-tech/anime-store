import pytest
from httpx import AsyncClient
from sqlalchemy import select
from app.models.user import User


async def get_admin_headers(client: AsyncClient, db_session):
    admin_reg = {
        "email": "payment_admin@example.com",
        "password": "AdminPassword123!",
        "full_name": "Payment Admin",
    }
    await client.post("/api/v1/auth/register", json=admin_reg)
    user_res = await db_session.execute(select(User).where(User.email == "payment_admin@example.com"))
    user = user_res.scalar_one()
    user.role = "admin"
    await db_session.flush()

    login_res = await client.post("/api/v1/auth/login", json={"email": "payment_admin@example.com", "password": "AdminPassword123!"})
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_payment_providers_and_config(client: AsyncClient, db_session):
    headers = await get_admin_headers(client, db_session)

    # 1. List Providers
    res = await client.get("/api/v1/payments/providers", headers=headers)
    assert res.status_code == 200
    providers = res.json()
    assert len(providers) >= 3
    codes = [p["code"] for p in providers]
    assert "aba_payway" in codes
    assert "khqr_bakong" in codes
    assert "acleda" in codes

    # 2. Update Provider config
    up_res = await client.put(
        "/api/v1/payments/providers/aba_payway",
        json={"is_enabled": True, "is_sandbox": False, "merchant_id": "merchant_aba_test_999"},
        headers=headers,
    )
    assert up_res.status_code == 200
    updated = up_res.json()
    assert updated["merchant_id"] == "merchant_aba_test_999"
    assert updated["is_sandbox"] is False


@pytest.mark.asyncio
async def test_payment_transaction_lifecycle(client: AsyncClient, db_session):
    headers = await get_admin_headers(client, db_session)

    # 1. Create Transaction
    tx_payload = {
        "order_number": "#ORD-8801",
        "provider_code": "aba_payway",
        "amount": 79.99,
        "currency": "USD",
        "payment_method": "KHQR",
        "customer_name": "Tanjiro Kamado",
        "customer_email": "tanjiro@slayer.org",
        "notes": "Express courier shipping",
    }
    res = await client.post("/api/v1/payments", json=tx_payload, headers=headers)
    assert res.status_code == 201
    tx = res.json()
    assert tx["status"] == "PENDING"
    assert tx["amount"] == 79.99
    tx_id = tx["id"]
    txn_code = tx["transaction_id"]

    # 2. Get Transaction By ID
    get_res = await client.get(f"/api/v1/payments/{tx_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["transaction_id"] == txn_code

    # 3. Server-side Verification
    verify_res = await client.post(
        "/api/v1/payments/verify",
        json={"transaction_id": txn_code, "provider_code": "aba_payway"},
        headers=headers,
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["verified"] is True
    assert verify_res.json()["status"] == "PAID"

    # 4. Refund Payment
    refund_res = await client.post(
        f"/api/v1/payments/{tx_id}/refund",
        json={"refund_amount": 79.99, "reason": "Customer cancellation within 24h"},
        headers=headers,
    )
    assert refund_res.status_code == 200
    assert refund_res.json()["status"] == "REFUNDED"
    assert refund_res.json()["refund_amount"] == 79.99


@pytest.mark.asyncio
async def test_webhook_and_duplicate_prevention(client: AsyncClient, db_session):
    headers = await get_admin_headers(client, db_session)

    # Create transaction
    tx_res = await client.post(
        "/api/v1/payments",
        json={
            "order_number": "#ORD-9901",
            "provider_code": "khqr_bakong",
            "amount": 35.00,
            "currency": "USD",
            "payment_method": "Bakong App",
            "customer_name": "Zenitsu Agatsuma",
            "customer_email": "zenitsu@slayer.org",
        },
        headers=headers,
    )
    tx_code = tx_res.json()["transaction_id"]

    # Post Webhook
    webhook_payload = {
        "transaction_id": tx_code,
        "provider_code": "khqr_bakong",
        "amount": 35.00,
        "currency": "USD",
        "status": "PAID",
        "signature": "simulated_secure_signature_hash_123",
    }
    wh_res = await client.post("/api/v1/payments/webhook/khqr_bakong", json=webhook_payload)
    assert wh_res.status_code == 200
    assert wh_res.json()["state"] == "PAID"

    # Duplicate webhook should succeed safely without double crediting
    wh_dup = await client.post("/api/v1/payments/webhook/khqr_bakong", json=webhook_payload)
    assert wh_dup.status_code == 200
    assert wh_dup.json()["state"] == "PAID"
