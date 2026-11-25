import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_order_creation_and_cart(client: AsyncClient):
    # 1. Add item to cart
    cart_add_res = await client.post(
        "/api/v1/cart/items",
        json={"product_id": 1, "quantity": 2, "variant": "Default"},
        headers={"X-Session-ID": "test-session-123"},
    )
    assert cart_add_res.status_code == 200
    cart = cart_add_res.json()
    assert cart["total_items"] == 2

    # 2. Create order
    order_payload = {
        "customer_name": "Tanaka San",
        "customer_email": "tanaka@example.com",
        "customer_phone": "+81 90 1234 5678",
        "shipping_address": "4-5-6 Akihabara, Tokyo",
        "city": "Tokyo",
        "payment_method": "Credit Card",
        "subtotal": 100.0,
        "shipping_fee": 10.0,
        "discount": 0.0,
        "tax": 10.0,
        "total_amount": 120.0,
        "items": [
            {
                "product_id": 1,
                "product_name": "Test Figure",
                "price": 50.0,
                "quantity": 2,
                "variant": "Default",
                "total": 100.0,
            }
        ],
    }
    order_res = await client.post("/api/v1/orders", json=order_payload)
    assert order_res.status_code == 201
    order_data = order_res.json()
    assert order_data["customer_name"] == "Tanaka San"
    assert order_data["total_amount"] == 120.0
    assert order_data["order_number"].startswith("#ORD-")
