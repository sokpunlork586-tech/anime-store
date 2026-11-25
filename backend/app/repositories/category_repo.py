from typing import Optional, List, Tuple
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.category import Category
from app.repositories.base import BaseRepository


class CategoryRepository(BaseRepository[Category]):
    def __init__(self, db: AsyncSession):
        super().__init__(Category, db)

    async def get_by_slug(self, slug: str) -> Optional[Category]:
        stmt = select(Category).where(Category.slug == slug)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all_with_counts(self) -> List[Tuple]:
        # Return categories with their products count
        stmt = (
            select(Category, func.count(Category.products))
            .outerjoin(Category.products)
            .group_by(Category.id)
            .order_by(Category.name)
        )
        result = await self.db.execute(stmt)
        return list(result.all())
