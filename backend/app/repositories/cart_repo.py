from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.product import Product
from app.repositories.base import BaseRepository


class CartRepository(BaseRepository[Cart]):
    def __init__(self, db: AsyncSession):
        super().__init__(Cart, db)

    async def get_or_create(self, user_id: Optional[int] = None, session_id: Optional[str] = None) -> Cart:
        query = select(Cart).options(
            selectinload(Cart.items).selectinload(CartItem.product).selectinload(Product.category),
            selectinload(Cart.items).selectinload(CartItem.product).selectinload(Product.images)
        )
        if user_id:
            query = query.where(Cart.user_id == user_id)
        elif session_id:
            query = query.where(Cart.session_id == session_id)
        else:
            cart = Cart()
            self.db.add(cart)
            await self.db.flush()
            return cart

        result = await self.db.execute(query)
        cart = result.scalar_one_or_none()
        if not cart:
            cart = Cart(user_id=user_id, session_id=session_id)
            self.db.add(cart)
            await self.db.flush()
            await self.db.refresh(cart)
        return cart

    async def add_item(self, cart_id: int, product_id: int, quantity: int = 1, variant: str = "") -> CartItem:
        stmt = select(CartItem).where(
            CartItem.cart_id == cart_id,
            CartItem.product_id == product_id,
            CartItem.variant == variant
        )
        res = await self.db.execute(stmt)
        item = res.scalar_one_or_none()
        if item:
            item.quantity += quantity
        else:
            item = CartItem(cart_id=cart_id, product_id=product_id, quantity=quantity, variant=variant)
            self.db.add(item)
        await self.db.flush()
        await self.db.refresh(item)
        return item

    async def update_item_quantity(self, cart_id: int, item_id: int, quantity: int) -> Optional[CartItem]:
        stmt = select(CartItem).where(CartItem.id == item_id, CartItem.cart_id == cart_id)
        res = await self.db.execute(stmt)
        item = res.scalar_one_or_none()
        if item:
            if quantity <= 0:
                await self.db.delete(item)
                item = None
            else:
                item.quantity = quantity
            await self.db.flush()
        return item

    async def remove_item(self, cart_id: int, item_id: int) -> bool:
        stmt = select(CartItem).where(CartItem.id == item_id, CartItem.cart_id == cart_id)
        res = await self.db.execute(stmt)
        item = res.scalar_one_or_none()
        if item:
            await self.db.delete(item)
            await self.db.flush()
            return True
        return False

    async def clear_cart(self, cart_id: int) -> bool:
        stmt = select(CartItem).where(CartItem.cart_id == cart_id)
        res = await self.db.execute(stmt)
        items = res.scalars().all()
        for it in items:
            await self.db.delete(it)
        await self.db.flush()
        return True
