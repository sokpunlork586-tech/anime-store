import pytest
from httpx import AsyncClient
from sqlalchemy import select
from app.models.user import User


async def get_admin_headers(client: AsyncClient, db_session):
    admin_reg = {
        "email": "super_admin_test@example.com",
        "password": "SuperPassword123!",
        "full_name": "Super Admin Master",
    }
    await client.post("/api/v1/auth/register", json=admin_reg)
    user_res = await db_session.execute(select(User).where(User.email == "super_admin_test@example.com"))
    user = user_res.scalar_one()
    user.role = "super_admin"
    await db_session.flush()

    login_res = await client.post("/api/v1/auth/login", json={"email": "super_admin_test@example.com", "password": "SuperPassword123!"})
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_roles_and_permissions(client: AsyncClient, db_session):
    headers = await get_admin_headers(client, db_session)

    # 1. Roles
    res_roles = await client.get("/api/v1/users/roles", headers=headers)
    assert res_roles.status_code == 200
    roles = res_roles.json()
    role_names = [r["name"] for r in roles]
    assert "super_admin" in role_names
    assert "admin" in role_names
    assert "staff" in role_names
    assert "customer" in role_names

    # 2. Permissions
    res_perms = await client.get("/api/v1/users/permissions", headers=headers)
    assert res_perms.status_code == 200
    perms = res_perms.json()
    assert len(perms) >= 5


@pytest.mark.asyncio
async def test_user_management_crud_and_status(client: AsyncClient, db_session):
    headers = await get_admin_headers(client, db_session)

    # 1. Create Staff User
    staff_payload = {
        "email": "staff_member_01@animestore.com",
        "password": "StaffPassword123!",
        "full_name": "Nezuko Assistant",
        "role": "staff",
        "phone": "+855 12 345 678",
        "city": "Phnom Penh",
        "is_active": True,
    }
    create_res = await client.post("/api/v1/users", json=staff_payload, headers=headers)
    assert create_res.status_code == 201
    staff_user = create_res.json()
    assert staff_user["role"] == "staff"
    assert staff_user["email"] == "staff_member_01@animestore.com"
    user_id = staff_user["id"]

    # 2. Get User
    get_res = await client.get(f"/api/v1/users/{user_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["full_name"] == "Nezuko Assistant"

    # 3. Toggle Status (deactivate)
    tog_res = await client.patch(f"/api/v1/users/{user_id}/toggle-status", headers=headers)
    assert tog_res.status_code == 200
    assert tog_res.json()["is_active"] is False

    # 4. Toggle Status (activate)
    tog_res2 = await client.patch(f"/api/v1/users/{user_id}/toggle-status", headers=headers)
    assert tog_res2.status_code == 200
    assert tog_res2.json()["is_active"] is True

    # 5. Reset Password
    reset_res = await client.post(
        f"/api/v1/users/{user_id}/reset-password",
        json={"new_password": "NewStaffPassword456!"},
        headers=headers,
    )
    assert reset_res.status_code == 200

    # Verify new password works
    login_new = await client.post(
        "/api/v1/auth/login",
        json={"email": "staff_member_01@animestore.com", "password": "NewStaffPassword456!"},
    )
    assert login_new.status_code == 200

    # 6. Check Activity Logs
    act_res = await client.get(f"/api/v1/users/{user_id}/activity", headers=headers)
    assert act_res.status_code == 200
    logs = act_res.json()["items"]
    assert len(logs) >= 2


@pytest.mark.asyncio
async def test_rbac_unauthorized_access_prevention(client: AsyncClient, db_session):
    # Register customer
    cust_reg = {
        "email": "regular_customer@example.com",
        "password": "Password123!",
        "full_name": "Regular Shopper",
    }
    reg_res = await client.post("/api/v1/auth/register", json=cust_reg)
    cust_token = reg_res.json()["access_token"]
    cust_headers = {"Authorization": f"Bearer {cust_token}"}

    # Attempt to access admin accounts endpoints as regular customer -> 403 Forbidden
    res_pay = await client.get("/api/v1/payments/providers", headers=cust_headers)
    assert res_pay.status_code == 403

    res_fin = await client.get("/api/v1/financial/summary", headers=cust_headers)
    assert res_fin.status_code == 403

    res_users = await client.get("/api/v1/users", headers=cust_headers)
    assert res_users.status_code == 403
