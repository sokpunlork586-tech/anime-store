import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_category_and_product_crud(client: AsyncClient, db_session):
    # 1. Register user and promote to admin
    from app.models.user import User
    from sqlalchemy import select

    admin_reg = {
        "email": "admin_test@example.com",
        "password": "AdminPassword123!",
        "full_name": "Test Admin",
    }
    reg_res = await client.post("/api/v1/auth/register", json=admin_reg)
    assert reg_res.status_code == 201

    # Promote to admin
    user_res = await db_session.execute(select(User).where(User.email == "admin_test@example.com"))
    user = user_res.scalar_one()
    user.role = "admin"
    await db_session.flush()

    # Re-login to get admin token or use login endpoint
    login_res = await client.post("/api/v1/auth/login", json={"email": "admin_test@example.com", "password": "AdminPassword123!"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Category
    cat_payload = {
        "name": "Nendoroid Figures",
        "slug": "nendoroid-figures",
        "description": "Chibi cute figures",
    }
    cat_res = await client.post("/api/v1/categories", json=cat_payload, headers=headers)
    assert cat_res.status_code == 201
    cat_data = cat_res.json()
    cat_id = cat_data["id"]

    # 3. Create Product
    prod_payload = {
        "sku": "NEN-001",
        "name": "Tanjiro Nendoroid",
        "slug": "tanjiro-nendoroid",
        "series": "Demon Slayer",
        "category_id": cat_id,
        "price": 55.0,
        "original_price": 65.0,
        "stock_quantity": 25,
        "status": "active",
        "description": "Tanjiro Kamado cute chibi nendoroid figure.",
        "images": ["https://images.unsplash.com/photo-1563089145-599997674d42"],
    }
    prod_res = await client.post("/api/v1/products", json=prod_payload, headers=headers)
    assert prod_res.status_code == 201
    prod_data = prod_res.json()
    assert prod_data["sku"] == "NEN-001"
    assert prod_data["stock_quantity"] == 25

    # 4. Get Products & Search Catalog
    list_res = await client.get("/api/v1/products")
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert list_data["total"] >= 1

    # Search by product name, category name, and series
    for term in ("tanjiro", "nendoroid", "demon"):
        search_res = await client.get("/api/v1/products", params={"search": term})
        assert search_res.status_code == 200
        items = search_res.json()["items"]
        assert any(item["sku"] == "NEN-001" for item in items)
