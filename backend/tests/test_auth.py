import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_user_registration_and_login(client: AsyncClient):
    # 1. Register
    reg_payload = {
        "email": "testuser@example.com",
        "password": "Password123!",
        "full_name": "Test User",
        "phone": "+1234567890",
        "address": "123 Otaku Way",
        "city": "Tokyo",
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    tokens = reg_res.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens

    # 2. Login
    login_payload = {
        "email": "testuser@example.com",
        "password": "Password123!",
    }
    login_res = await client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    login_tokens = login_res.json()
    assert "access_token" in login_tokens

    # 3. Access /me
    access_token = login_tokens["access_token"]
    me_res = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {access_token}"})
    assert me_res.status_code == 200
    user_data = me_res.json()
    assert user_data["email"] == "testuser@example.com"
    assert user_data["full_name"] == "Test User"
