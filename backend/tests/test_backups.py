import json
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from app.models.user import User


async def get_admin_headers(client: AsyncClient, db_session):
    admin_reg = {
        "email": "backup_admin@example.com",
        "password": "AdminPassword123!",
        "full_name": "Backup Administrator",
    }
    await client.post("/api/v1/auth/register", json=admin_reg)
    user_res = await db_session.execute(select(User).where(User.email == "backup_admin@example.com"))
    user = user_res.scalar_one()
    user.role = "admin"
    await db_session.flush()

    login_res = await client.post("/api/v1/auth/login", json={"email": "backup_admin@example.com", "password": "AdminPassword123!"})
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_auto_backup_config(client: AsyncClient, db_session):
    headers = await get_admin_headers(client, db_session)

    # 1. Get Config
    res = await client.get("/api/v1/backups/config", headers=headers)
    assert res.status_code == 200
    cfg = res.json()
    assert "is_enabled" in cfg
    assert "frequency" in cfg

    # 2. Update Config
    update_payload = {
        "is_enabled": True,
        "frequency": "weekly",
        "backup_time": "03:30",
        "retention_days": 60,
    }
    up_res = await client.put("/api/v1/backups/config", json=update_payload, headers=headers)
    assert up_res.status_code == 200
    updated_cfg = up_res.json()
    assert updated_cfg["frequency"] == "weekly"
    assert updated_cfg["backup_time"] == "03:30"
    assert updated_cfg["retention_days"] == 60


@pytest.mark.asyncio
async def test_backup_create_download_restore_delete(client: AsyncClient, db_session):
    headers = await get_admin_headers(client, db_session)

    # 1. Create Backup
    create_res = await client.post(
        "/api/v1/backups",
        json={"backup_type": "full", "notes": "Pre-deployment system state snapshot"},
        headers=headers,
    )
    assert create_res.status_code == 201
    backup = create_res.json()
    assert backup["status"] == "completed"
    assert backup["backup_type"] == "full"
    backup_id = backup["id"]
    filename = backup["filename"]

    # 2. List Backups
    list_res = await client.get("/api/v1/backups", headers=headers)
    assert list_res.status_code == 200
    backups = list_res.json()
    assert any(b["id"] == backup_id for b in backups)

    # 3. Download Backup File
    down_res = await client.get(f"/api/v1/backups/{backup_id}/download", headers=headers)
    assert down_res.status_code == 200
    file_bytes = down_res.content
    parsed = json.loads(file_bytes.decode("utf-8"))
    assert "tables" in parsed
    assert "version" in parsed

    # 4. Restore from Backup Record
    restore_res = await client.post(f"/api/v1/backups/{backup_id}/restore", headers=headers)
    assert restore_res.status_code == 200
    rest_data = restore_res.json()
    assert rest_data["success"] is True

    # 5. Restore from Uploaded File
    upload_res = await client.post(
        "/api/v1/backups/upload-restore",
        files={"file": (filename, file_bytes, "application/json")},
        headers=headers,
    )
    assert upload_res.status_code == 200
    assert upload_res.json()["success"] is True

    # 6. Delete Backup
    del_res = await client.delete(f"/api/v1/backups/{backup_id}", headers=headers)
    assert del_res.status_code == 204
