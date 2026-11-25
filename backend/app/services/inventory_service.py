from datetime import datetime, timezone
from typing import List, Tuple, Optional
from fastapi import HTTPException, status
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.inventory import Inventory, InventoryTransaction
from app.models.product import Product
from app.schemas.inventory import InventoryResponse, InventoryTransactionResponse


class InventoryService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_overview(self) -> List[InventoryResponse]:
        stmt = select(Inventory).options(selectinload(Inventory.product).selectinload(Product.category)).order_by(Inventory.current_stock)
        res = await self.db.execute(stmt)
        items = res.scalars().all()
        result = []
        for it in items:
            p_name = it.product.name if it.product else ""
            sku = it.product.sku if it.product else ""
            cat = it.product.category.name if (it.product and it.product.category) else ""
            result.append(
                InventoryResponse(
                    id=it.id,
                    product_id=it.product_id,
                    product_name=p_name,
                    sku=sku,
                    category=cat,
                    current_stock=it.current_stock,
                    min_stock=it.min_stock,
                    max_stock=it.max_stock,
                    status=it.status,
                    last_restocked=it.last_restocked,
                    updated_at=it.updated_at,
                )
            )
        return result

    async def adjust_stock(self, product_id: int, adj_type: str, quantity: int, reason: str, user_name: str = "Admin") -> InventoryResponse:
        stmt = select(Inventory).where(Inventory.product_id == product_id).options(selectinload(Inventory.product))
        res = await self.db.execute(stmt)
        inv = res.scalar_one_or_none()
        if not inv:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory record not found")

        prev_stock = inv.current_stock
        if adj_type == "in":
            new_stock = prev_stock + quantity
            inv.last_restocked = datetime.now(timezone.utc)
        elif adj_type == "out":
            new_stock = max(0, prev_stock - quantity)
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid adjustment type")

        inv.current_stock = new_stock
        inv.status = "out_of_stock" if new_stock == 0 else "low_stock" if new_stock <= inv.min_stock else "in_stock"

        if inv.product:
            inv.product.stock_quantity = new_stock

        trans = InventoryTransaction(
            product_id=product_id,
            type=adj_type,
            quantity=quantity,
            previous_stock=prev_stock,
            new_stock=new_stock,
            reason=reason,
            created_by=user_name,
        )
        self.db.add(trans)
        await self.db.flush()
        await self.db.refresh(inv)

        return InventoryResponse(
            id=inv.id,
            product_id=inv.product_id,
            product_name=inv.product.name if inv.product else "",
            sku=inv.product.sku if inv.product else "",
            category="",
            current_stock=inv.current_stock,
            min_stock=inv.min_stock,
            max_stock=inv.max_stock,
            status=inv.status,
            last_restocked=inv.last_restocked,
            updated_at=inv.updated_at,
        )

    async def get_transactions(self, limit: int = 50) -> List[InventoryTransactionResponse]:
        stmt = (
            select(InventoryTransaction)
            .options(selectinload(InventoryTransaction.product))
            .order_by(desc(InventoryTransaction.created_at))
            .limit(limit)
        )
        res = await self.db.execute(stmt)
        trans_list = res.scalars().all()
        return [
            InventoryTransactionResponse(
                id=t.id,
                product_id=t.product_id,
                product_name=t.product.name if t.product else "",
                type=t.type,
                quantity=t.quantity,
                previous_stock=t.previous_stock,
                new_stock=t.new_stock,
                reason=t.reason,
                created_by=t.created_by,
                created_at=t.created_at,
            )
            for t in trans_list
        ]
