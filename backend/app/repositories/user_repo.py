from typing import Optional, List, Tuple
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, db: AsyncSession):
        super().__init__(User, db)

    async def get_by_email(self, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email.lower().strip())
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_customers(
        self,
        search: Optional[str] = None,
        role: Optional[str] = None,
        skip: int = 0,
        limit: int = 20
    ) -> Tuple[List[User], int]:
        query = select(User)
        count_query = select(func.count()).select_from(User)

        if role:
            query = query.where(User.role == role)
            count_query = count_query.where(User.role == role)

        if search:
            search_filter = (
                User.full_name.ilike(f"%{search}%")
                | User.email.ilike(f"%{search}%")
                | User.phone.ilike(f"%{search}%")
                | User.city.ilike(f"%{search}%")
            )
            query = query.where(search_filter)
            count_query = count_query.where(search_filter)

        total_res = await self.db.execute(count_query)
        total = total_res.scalar() or 0

        query = query.order_by(desc(User.created_at)).offset(skip).limit(limit)
        items_res = await self.db.execute(query)
        return list(items_res.scalars().all()), total
