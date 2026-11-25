from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_admin_user
from app.models.user import User
from app.schemas.inventory import InventoryResponse, StockAdjustmentRequest, InventoryTransactionResponse
from app.services.inventory_service import InventoryService

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.get("", response_model=List[InventoryResponse])
async def get_stock_overview(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    service = InventoryService(db)
    return await service.get_overview()


@router.post("/adjust", response_model=InventoryResponse)
async def adjust_stock(
    req: StockAdjustmentRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    service = InventoryService(db)
    return await service.adjust_stock(
        product_id=req.product_id,
        adj_type=req.type,
        quantity=req.quantity,
        reason=req.reason or "Stock adjustment",
        user_name=admin.full_name,
    )


@router.get("/transactions", response_model=List[InventoryTransactionResponse])
async def get_inventory_transactions(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    service = InventoryService(db)
    return await service.get_transactions(limit=limit)
