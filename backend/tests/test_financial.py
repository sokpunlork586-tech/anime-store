import pytest
from httpx import AsyncClient
from sqlalchemy import select
from app.models.user import User


async def get_admin_headers(client: AsyncClient, db_session):
    admin_reg = {
        "email": "financial_admin@example.com",
        "password": "AdminPassword123!",
        "full_name": "Finance Admin",
    }
    await client.post("/api/v1/auth/register", json=admin_reg)
    user_res = await db_session.execute(select(User).where(User.email == "financial_admin@example.com"))
    user = user_res.scalar_one()
    user.role = "admin"
    await db_session.flush()

    login_res = await client.post("/api/v1/auth/login", json={"email": "financial_admin@example.com", "password": "AdminPassword123!"})
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_financial_accounts_crud(client: AsyncClient, db_session):
    headers = await get_admin_headers(client, db_session)

    # 1. List Accounts
    res = await client.get("/api/v1/financial/accounts", headers=headers)
    assert res.status_code == 200
    accounts = res.json()
    assert len(accounts) >= 3

    # 2. Create Account
    new_acc = {
        "account_name": "Wing Bank Vault",
        "account_number": "WING-009-8812",
        "bank_name": "Wing Bank",
        "account_type": "settlement",
        "balance": 2500.0,
        "currency": "USD",
        "is_active": True,
        "notes": "Wing merchant settlement",
    }
    create_res = await client.post("/api/v1/financial/accounts", json=new_acc, headers=headers)
    assert create_res.status_code == 201
    assert create_res.json()["account_name"] == "Wing Bank Vault"


@pytest.mark.asyncio
async def test_income_and_expense_management(client: AsyncClient, db_session):
    headers = await get_admin_headers(client, db_session)

    # 1. Create Income
    inc_payload = {
        "title": "Anime Expo 2026 Booth Ticket Sales",
        "category": "Events",
        "amount": 1500.0,
        "currency": "USD",
        "date": "2026-11-20",
        "reference_number": "EXP-BOOTH-01",
        "payment_method": "Bank Transfer",
        "account_name": "ABA Main Merchant Account",
        "notes": "Advance ticket sales",
    }
    inc_res = await client.post("/api/v1/financial/income", json=inc_payload, headers=headers)
    assert inc_res.status_code == 201
    assert inc_res.json()["amount"] == 1500.0

    # 2. List Income
    list_inc = await client.get("/api/v1/financial/income", headers=headers)
    assert list_inc.status_code == 200
    assert list_inc.json()["total"] >= 1

    # 3. Create Expense
    exp_payload = {
        "title": "Anime Figures Restock from Bandai Spirits",
        "category": "Inventory Import",
        "amount": 650.0,
        "currency": "USD",
        "date": "2026-11-21",
        "payment_method": "Wire Transfer",
        "account_name": "ABA Main Merchant Account",
        "receipt_url": "https://receipts.example.com/inv-9921.pdf",
        "notes": "Bulk discount included",
    }
    exp_res = await client.post("/api/v1/financial/expenses", json=exp_payload, headers=headers)
    assert exp_res.status_code == 201
    exp_data = exp_res.json()
    assert exp_data["amount"] == 650.0
    exp_id = exp_data["id"]

    # 4. Update Expense
    exp_update = {
        **exp_payload,
        "amount": 700.0,
        "notes": "Updated for customs import clearance fee",
    }
    up_res = await client.put(f"/api/v1/financial/expenses/{exp_id}", json=exp_update, headers=headers)
    assert up_res.status_code == 200
    assert up_res.json()["amount"] == 700.0


@pytest.mark.asyncio
async def test_financial_summary_and_reports(client: AsyncClient, db_session):
    headers = await get_admin_headers(client, db_session)

    # 1. Summary
    sum_res = await client.get("/api/v1/financial/summary", headers=headers)
    assert sum_res.status_code == 200
    summary = sum_res.json()
    assert "total_revenue" in summary
    assert "total_expenses" in summary
    assert "net_profit" in summary
    # Net profit calculation formula: Total Revenue - Total Expenses
    assert round(summary["total_revenue"] - summary["total_expenses"], 2) == summary["net_profit"]

    # 2. Reports
    rep_res = await client.get("/api/v1/financial/reports?period=monthly", headers=headers)
    assert rep_res.status_code == 200
    report = rep_res.json()
    assert report["report_type"] == "monthly"
    assert len(report["items"]) > 0
    assert "revenue_by_category" in report
    assert "expenses_by_category" in report
