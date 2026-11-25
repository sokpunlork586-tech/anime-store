from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.cart_repo import CartRepository
from app.schemas.cart import CartResponse, CartItemResponse
from app.schemas.product import ProductResponse


class CartService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.cart_repo = CartRepository(db)

    def _to_response(self, cart) -> CartResponse:
        total_items = 0
        subtotal = 0.0
        items_resp = []

        for item in cart.items:
            prod_resp = None
            if item.product:
                cat_name = item.product.category.name if item.product.category else ""
                prod_resp = ProductResponse(
                    id=item.product.id,
                    sku=item.product.sku,
                    name=item.product.name,
                    slug=item.product.slug,
                    series=item.product.series,
                    category_id=item.product.category_id,
                    category_name=cat_name,
                    price=item.product.price,
                    original_price=item.product.original_price,
                    rating=item.product.rating,
                    review_count=item.product.review_count,
                    units_sold=item.product.units_sold,
                    image_url=item.product.image_url,
                    stock_quantity=item.product.stock_quantity,
                    status=item.product.status,
                    created_at=item.product.created_at,
                    updated_at=item.product.updated_at,
                )
                subtotal += item.product.price * item.quantity

            total_items += item.quantity
            items_resp.append(
                CartItemResponse(
                    id=item.id,
                    product_id=item.product_id,
                    quantity=item.quantity,
                    variant=item.variant,
                    product=prod_resp,
                    created_at=item.created_at,
                )
            )

        return CartResponse(
            id=cart.id,
            user_id=cart.user_id,
            session_id=cart.session_id,
            items=items_resp,
            total_items=total_items,
            subtotal=round(subtotal, 2),
        )

    async def get_cart(self, user_id: Optional[int] = None, session_id: Optional[str] = None) -> CartResponse:
        cart = await self.cart_repo.get_or_create(user_id=user_id, session_id=session_id)
        return self._to_response(cart)

    async def add_item(self, user_id: Optional[int], session_id: Optional[str], product_id: int, quantity: int = 1, variant: str = "") -> CartResponse:
        cart = await self.cart_repo.get_or_create(user_id=user_id, session_id=session_id)
        await self.cart_repo.add_item(cart.id, product_id, quantity, variant)
        return await self.get_cart(user_id=user_id, session_id=session_id)

    async def update_quantity(self, user_id: Optional[int], session_id: Optional[str], item_id: int, quantity: int) -> CartResponse:
        cart = await self.cart_repo.get_or_create(user_id=user_id, session_id=session_id)
        await self.cart_repo.update_item_quantity(cart.id, item_id, quantity)
        return await self.get_cart(user_id=user_id, session_id=session_id)

    async def remove_item(self, user_id: Optional[int], session_id: Optional[str], item_id: int) -> CartResponse:
        cart = await self.cart_repo.get_or_create(user_id=user_id, session_id=session_id)
        await self.cart_repo.remove_item(cart.id, item_id)
        return await self.get_cart(user_id=user_id, session_id=session_id)

    async def clear_cart(self, user_id: Optional[int], session_id: Optional[str]) -> CartResponse:
        cart = await self.cart_repo.get_or_create(user_id=user_id, session_id=session_id)
        await self.cart_repo.clear_cart(cart.id)
        return await self.get_cart(user_id=user_id, session_id=session_id)
