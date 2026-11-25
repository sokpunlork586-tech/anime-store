from typing import Optional, List, Tuple
from sqlalchemy import select, func, desc, asc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.product import Product
from app.models.category import Category
from app.repositories.base import BaseRepository


class ProductRepository(BaseRepository[Product]):
    def __init__(self, db: AsyncSession):
        super().__init__(Product, db)

    async def get_with_details(self, id: int) -> Optional[Product]:
        stmt = (
            select(Product)
            .where(Product.id == id)
            .options(
                selectinload(Product.category),
                selectinload(Product.images),
                selectinload(Product.reviews),
                selectinload(Product.inventory_record),
            )
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_slug(self, slug: str) -> Optional[Product]:
        stmt = (
            select(Product)
            .where(Product.slug == slug)
            .options(selectinload(Product.category), selectinload(Product.images))
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_sku(self, sku: str) -> Optional[Product]:
        stmt = select(Product).where(Product.sku == sku)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def filter_products(
        self,
        category_id: Optional[int] = None,
        category_slug: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
        featured: Optional[bool] = None,
        is_new_arrival: Optional[bool] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        sort_by: Optional[str] = "created_at",
        sort_order: Optional[str] = "desc",
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[Product], int]:
        query = select(Product).options(selectinload(Product.category), selectinload(Product.images))
        count_query = select(func.count()).select_from(Product)

        if category_id:
            query = query.where(Product.category_id == category_id)
            count_query = count_query.where(Product.category_id == category_id)

        if category_slug:
            query = query.join(Product.category).where(Category.slug == category_slug)
            count_query = count_query.join(Product.category).where(Category.slug == category_slug)

        if status:
            query = query.where(Product.status == status)
            count_query = count_query.where(Product.status == status)

        if featured is not None:
            query = query.where(Product.featured == featured)
            count_query = count_query.where(Product.featured == featured)

        if is_new_arrival is not None:
            query = query.where(Product.is_new_arrival == is_new_arrival)
            count_query = count_query.where(Product.is_new_arrival == is_new_arrival)

        if min_price is not None:
            query = query.where(Product.price >= min_price)
            count_query = count_query.where(Product.price >= min_price)

        if max_price is not None:
            query = query.where(Product.price <= max_price)
            count_query = count_query.where(Product.price <= max_price)

        if search:
            search_pattern = f"%{search}%"
            search_cond = (
                Product.name.ilike(search_pattern)
                | Product.sku.ilike(search_pattern)
                | Product.series.ilike(search_pattern)
                | Product.description.ilike(search_pattern)
            )
            query = query.where(search_cond)
            count_query = count_query.where(search_cond)

        total_res = await self.db.execute(count_query)
        total = total_res.scalar() or 0

        # Sorting
        sort_col = getattr(Product, sort_by, Product.created_at)
        if sort_order == "asc":
            query = query.order_by(asc(sort_col))
        else:
            query = query.order_by(desc(sort_col))

        query = query.offset(skip).limit(limit)
        items_res = await self.db.execute(query)
        return list(items_res.scalars().all()), total
