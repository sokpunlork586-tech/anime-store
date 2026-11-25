from typing import Optional
from fastapi import APIRouter, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.cart import CartResponse, CartItemCreate, CartItemUpdate
from app.services.cart_service import CartService

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("", response_model=CartResponse)
async def get_cart(
    session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    db: AsyncSession = Depends(get_db),
):
    service = CartService(db)
    return await service.get_cart(session_id=session_id)


@router.post("/items", response_model=CartResponse)
async def add_item_to_cart(
    req: CartItemCreate,
    session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    db: AsyncSession = Depends(get_db),
):
    service = CartService(db)
    return await service.add_item(
        user_id=None,
        session_id=session_id,
        product_id=req.product_id,
        quantity=req.quantity,
        variant=req.variant or "",
    )


@router.put("/items/{item_id}", response_model=CartResponse)
async def update_cart_item(
    item_id: int,
    req: CartItemUpdate,
    session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    db: AsyncSession = Depends(get_db),
):
    service = CartService(db)
    return await service.update_quantity(user_id=None, session_id=session_id, item_id=item_id, quantity=req.quantity)


@router.delete("/items/{item_id}", response_model=CartResponse)
async def remove_cart_item(
    item_id: int,
    session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    db: AsyncSession = Depends(get_db),
):
    service = CartService(db)
    return await service.remove_item(user_id=None, session_id=session_id, item_id=item_id)


@router.delete("", response_model=CartResponse)
async def clear_cart(
    session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    db: AsyncSession = Depends(get_db),
):
    service = CartService(db)
    return await service.clear_cart(user_id=None, session_id=session_id)
