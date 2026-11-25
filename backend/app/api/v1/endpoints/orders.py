from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_admin_user, get_optional_admin_user
from app.models.user import User
from app.schemas.order import OrderCreate, OrderUpdateStatus, OrderBulkDeleteRequest, OrderResponse
from app.services.order_service import OrderService
from app.utils.pagination import PaginatedResponse

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("", response_model=PaginatedResponse[OrderResponse])
async def list_orders(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    admin: Optional[User] = Depends(get_optional_admin_user),
):
    service = OrderService(db)
    skip = (page - 1) * page_size
    items, total = await service.filter_orders(
        status=status_filter,
        search=search,
        skip=skip,
        limit=page_size,
    )
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/my-orders", response_model=PaginatedResponse[OrderResponse])
async def list_my_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = OrderService(db)
    skip = (page - 1) * page_size
    items, total = await service.filter_orders(
        user_id=current_user.id,
        skip=skip,
        limit=page_size,
    )
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    req: OrderCreate,
    db: AsyncSession = Depends(get_db),
):
    service = OrderService(db)
    return await service.create_order(req)


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order_details(order_id: int, db: AsyncSession = Depends(get_db)):
    service = OrderService(db)
    return await service.get_by_id(order_id)


@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    req: OrderUpdateStatus,
    db: AsyncSession = Depends(get_db),
    admin: Optional[User] = Depends(get_optional_admin_user),
):
    service = OrderService(db)
    return await service.update_status(order_id, req)


@router.post("/bulk-delete")
async def bulk_delete_orders(
    req: OrderBulkDeleteRequest,
    db: AsyncSession = Depends(get_db),
    admin: Optional[User] = Depends(get_optional_admin_user),
):
    service = OrderService(db)
    deleted_count = await service.bulk_delete_orders(req.ids)
    return {"deleted": deleted_count}


@router.delete("/{order_id}")
async def delete_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    admin: Optional[User] = Depends(get_optional_admin_user),
):
    service = OrderService(db)
    await service.delete_order(order_id)
    return {"deleted": True, "id": order_id}
