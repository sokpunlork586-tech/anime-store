from typing import List
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.wishlist import Wishlist
from app.models.product import Product
from app.schemas.wishlist import WishlistResponse
from app.schemas.product import ProductResponse


class WishlistService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_wishlist(self, user_id: int) -> List[WishlistResponse]:
        stmt = (
            select(Wishlist)
            .where(Wishlist.user_id == user_id)
            .options(
                selectinload(Wishlist.product).selectinload(Product.category),
                selectinload(Wishlist.product).selectinload(Product.images),
            )
        )
        res = await self.db.execute(stmt)
        items = res.scalars().all()
        result = []
        for it in items:
            prod_resp = None
            if it.product:
                cat_name = it.product.category.name if it.product.category else ""
                prod_resp = ProductResponse(
                    id=it.product.id,
                    sku=it.product.sku,
                    name=it.product.name,
                    slug=it.product.slug,
                    series=it.product.series,
                    category_id=it.product.category_id,
                    category_name=cat_name,
                    price=it.product.price,
                    original_price=it.product.original_price,
                    rating=it.product.rating,
                    review_count=it.product.review_count,
                    units_sold=it.product.units_sold,
                    image_url=it.product.image_url,
                    stock_quantity=it.product.stock_quantity,
                    status=it.product.status,
                    created_at=it.product.created_at,
                    updated_at=it.product.updated_at,
                )
            result.append(
                WishlistResponse(
                    id=it.id,
                    user_id=it.user_id,
                    product_id=it.product_id,
                    product=prod_resp,
                    created_at=it.created_at,
                )
            )
        return result

    async def add_to_wishlist(self, user_id: int, product_id: int) -> WishlistResponse:
        stmt = select(Wishlist).where(Wishlist.user_id == user_id, Wishlist.product_id == product_id)
        res = await self.db.execute(stmt)
        existing = res.scalar_one_or_none()
        if existing:
            return WishlistResponse(id=existing.id, user_id=user_id, product_id=product_id, created_at=existing.created_at)

        new_item = Wishlist(user_id=user_id, product_id=product_id)
        self.db.add(new_item)
        await self.db.flush()
        await self.db.refresh(new_item)
        return WishlistResponse(id=new_item.id, user_id=user_id, product_id=product_id, created_at=new_item.created_at)

    async def remove_from_wishlist(self, user_id: int, product_id: int) -> bool:
        stmt = select(Wishlist).where(Wishlist.user_id == user_id, Wishlist.product_id == product_id)
        res = await self.db.execute(stmt)
        item = res.scalar_one_or_none()
        if item:
            await self.db.delete(item)
            await self.db.flush()
            return True
        return False
