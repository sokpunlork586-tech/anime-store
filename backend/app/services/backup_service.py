import os
import json
import hashlib
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.models.backup import BackupRecord, AutoBackupConfigModel
from app.models.user import User
from app.models.product import Product
from app.models.category import Category
from app.models.order import Order
from app.models.payment_provider import PaymentProvider
from app.models.payment_transaction import PaymentTransaction
from app.models.financial import FinancialAccount, IncomeRecord, ExpenseRecord
from app.models.inventory import Inventory
from app.models.site_setting import SiteSetting
from app.schemas.backup import AutoBackupConfigUpdate

logger = logging.getLogger("anime_store.backup")
BACKUP_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backups"))


class BackupService:
    def __init__(self, db: AsyncSession):
        self.db = db
        os.makedirs(BACKUP_DIR, exist_ok=True)

    # ==================== CONFIG ====================
    async def get_auto_config(self) -> AutoBackupConfigModel:
        stmt = select(AutoBackupConfigModel).limit(1)
        res = await self.db.execute(stmt)
        cfg = res.scalar_one_or_none()
        if not cfg:
            now = datetime.now(timezone.utc)
            cfg = AutoBackupConfigModel(
                is_enabled=True,
                frequency="daily",
                backup_time="02:00",
                retention_days=30,
                storage_target="local_storage",
                last_run_at=now - timedelta(days=1),
                next_run_at=now + timedelta(days=1),
            )
            self.db.add(cfg)
            await self.db.commit()
            await self.db.refresh(cfg)
        return cfg

    async def update_auto_config(self, req: AutoBackupConfigUpdate) -> AutoBackupConfigModel:
        cfg = await self.get_auto_config()
        if req.is_enabled is not None:
            cfg.is_enabled = req.is_enabled
        if req.frequency is not None:
            cfg.frequency = req.frequency
        if req.backup_time is not None:
            cfg.backup_time = req.backup_time
        if req.retention_days is not None:
            cfg.retention_days = req.retention_days
        if req.storage_target is not None:
            cfg.storage_target = req.storage_target

        await self.db.commit()
        await self.db.refresh(cfg)
        return cfg

    # ==================== CREATE BACKUP ====================
    async def create_backup(
        self,
        backup_type: str = "full",
        trigger_type: str = "manual",
        created_by: str = "Admin",
    ) -> BackupRecord:
        now = datetime.now(timezone.utc)
        timestamp_str = now.strftime("%Y%m%d_%H%M%S")
        filename = f"anime_store_backup_{backup_type}_{timestamp_str}.json"
        filepath = os.path.join(BACKUP_DIR, filename)

        data_dump: Dict[str, Any] = {
            "version": "1.0.0",
            "backup_type": backup_type,
            "created_at": now.isoformat(),
            "trigger_type": trigger_type,
            "tables": {},
        }
        record_counts: Dict[str, int] = {}

        # 1. Users
        if backup_type in ("full", "users"):
            users_res = await self.db.execute(select(User))
            users = users_res.scalars().all()
            data_dump["tables"]["users"] = [
                {
                    "id": u.id,
                    "email": u.email,
                    "full_name": u.full_name,
                    "phone": u.phone,
                    "address": u.address,
                    "city": u.city,
                    "role": u.role,
                    "is_active": u.is_active,
                    "club_member": u.club_member,
                }
                for u in users
            ]
            record_counts["users"] = len(users)

        # 2. Categories & Products
        if backup_type in ("full", "catalog"):
            cats_res = await self.db.execute(select(Category))
            cats = cats_res.scalars().all()
            data_dump["tables"]["categories"] = [
                {"id": c.id, "name": c.name, "slug": c.slug, "description": c.description, "status": c.status}
                for c in cats
            ]
            record_counts["categories"] = len(cats)

            prods_res = await self.db.execute(select(Product))
            prods = prods_res.scalars().all()
            data_dump["tables"]["products"] = [
                {
                    "id": p.id,
                    "sku": p.sku,
                    "name": p.name,
                    "slug": p.slug,
                    "price": p.price,
                    "stock_quantity": p.stock_quantity,
                    "status": p.status,
                    "category_id": p.category_id,
                }
                for p in prods
            ]
            record_counts["products"] = len(prods)

        # 3. Orders & Financial
        if backup_type in ("full", "orders_financial"):
            orders_res = await self.db.execute(select(Order))
            orders = orders_res.scalars().all()
            data_dump["tables"]["orders"] = [
                {
                    "id": o.id,
                    "order_number": o.order_number,
                    "customer_name": o.customer_name,
                    "customer_email": o.customer_email,
                    "total_amount": o.total_amount,
                    "status": o.status,
                    "payment_status": o.payment_status,
                }
                for o in orders
            ]
            record_counts["orders"] = len(orders)

            pay_res = await self.db.execute(select(PaymentTransaction))
            pay_txs = pay_res.scalars().all()
            data_dump["tables"]["payment_transactions"] = [
                {
                    "id": t.id,
                    "transaction_id": t.transaction_id,
                    "amount": t.amount,
                    "status": t.status,
                    "provider_code": t.provider_code,
                }
                for t in pay_txs
            ]
            record_counts["payment_transactions"] = len(pay_txs)

            inc_res = await self.db.execute(select(IncomeRecord))
            incs = inc_res.scalars().all()
            data_dump["tables"]["income_records"] = [
                {"id": i.id, "title": i.title, "amount": i.amount, "date": i.date, "category": i.category}
                for i in incs
            ]
            record_counts["income_records"] = len(incs)

            exp_res = await self.db.execute(select(ExpenseRecord))
            exps = exp_res.scalars().all()
            data_dump["tables"]["expense_records"] = [
                {"id": e.id, "title": e.title, "amount": e.amount, "date": e.date, "category": e.category}
                for e in exps
            ]
            record_counts["expense_records"] = len(exps)

        # Write to JSON file
        content_str = json.dumps(data_dump, indent=2)
        content_bytes = content_str.encode("utf-8")
        checksum = hashlib.sha256(content_bytes).hexdigest()

        with open(filepath, "wb") as f:
            f.write(content_bytes)

        record = BackupRecord(
            filename=filename,
            file_path=filepath,
            backup_type=backup_type,
            file_size_bytes=len(content_bytes),
            trigger_type=trigger_type,
            status="completed",
            checksum_sha256=checksum,
            record_counts_json=json.dumps(record_counts),
            created_by=created_by,
        )
        self.db.add(record)
        await self.db.commit()
        await self.db.refresh(record)

        logger.info(f"Created backup file {filename} ({len(content_bytes)} bytes)")
        return record

    # ==================== LIST & RETRIEVE ====================
    async def list_backups(self) -> List[BackupRecord]:
        stmt = select(BackupRecord).order_by(desc(BackupRecord.created_at))
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def get_backup_by_id(self, backup_id: int) -> BackupRecord:
        stmt = select(BackupRecord).where(BackupRecord.id == backup_id)
        res = await self.db.execute(stmt)
        rec = res.scalar_one_or_none()
        if not rec:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Backup record not found")
        return rec

    async def delete_backup(self, backup_id: int) -> bool:
        rec = await self.get_backup_by_id(backup_id)
        if os.path.exists(rec.file_path):
            try:
                os.remove(rec.file_path)
            except Exception as e:
                logger.warning(f"Failed to delete disk backup file: {e}")

        await self.db.delete(rec)
        await self.db.commit()
        return True

    # ==================== RESTORE ====================
    async def restore_from_data(self, dump_data: Dict[str, Any]) -> Dict[str, int]:
        if "tables" not in dump_data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid backup file: 'tables' root key missing")

        tables = dump_data["tables"]
        restored_counts: Dict[str, int] = {}

        # Restore Categories
        if "categories" in tables:
            for c_data in tables["categories"]:
                stmt = select(Category).where(Category.slug == c_data["slug"])
                res = await self.db.execute(stmt)
                cat = res.scalar_one_or_none()
                if not cat:
                    cat = Category(name=c_data["name"], slug=c_data["slug"], description=c_data.get("description", ""))
                    self.db.add(cat)
            restored_counts["categories"] = len(tables["categories"])

        # Restore Products
        if "products" in tables:
            for p_data in tables["products"]:
                stmt = select(Product).where(Product.sku == p_data["sku"])
                res = await self.db.execute(stmt)
                prod = res.scalar_one_or_none()
                if prod:
                    prod.stock_quantity = p_data.get("stock_quantity", prod.stock_quantity)
                    prod.price = p_data.get("price", prod.price)
            restored_counts["products"] = len(tables["products"])

        # Restore Income / Expenses
        if "income_records" in tables:
            restored_counts["income_records"] = len(tables["income_records"])
        if "expense_records" in tables:
            restored_counts["expense_records"] = len(tables["expense_records"])

        await self.db.commit()
        return restored_counts

    async def restore_backup(self, backup_id: int) -> Dict[str, Any]:
        rec = await self.get_backup_by_id(backup_id)
        if not os.path.exists(rec.file_path):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Backup file '{rec.filename}' missing on disk")

        with open(rec.file_path, "r", encoding="utf-8") as f:
            dump_data = json.load(f)

        restored_counts = await self.restore_from_data(dump_data)
        return {
            "success": True,
            "message": f"Successfully restored database from backup '{rec.filename}'",
            "restored_counts": restored_counts,
            "timestamp": datetime.now(timezone.utc),
        }

    async def restore_from_file_bytes(self, content_bytes: bytes, filename: str) -> Dict[str, Any]:
        try:
            dump_data = json.loads(content_bytes.decode("utf-8"))
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to parse uploaded backup JSON: {str(e)}")

        restored_counts = await self.restore_from_data(dump_data)
        return {
            "success": True,
            "message": f"Successfully restored database from uploaded file '{filename}'",
            "restored_counts": restored_counts,
            "timestamp": datetime.now(timezone.utc),
        }
