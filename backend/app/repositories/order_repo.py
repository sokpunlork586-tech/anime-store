from typing import Optional, List, Tuple
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.order import Order
from app.repositories.base import BaseRepository


class OrderRepository(BaseRepository[Order]):
    def __init__(self, db: AsyncSession):
        super().__init__(Order, db)

    async def get_with_details(self, id: int) -> Optional[Order]:
        stmt = (
            select(Order)
            .where(Order.id == id)
            .options(selectinload(Order.items), selectinload(Order.payment), selectinload(Order.user))
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_order_number(self, order_number: str) -> Optional[Order]:
        stmt = (
            select(Order)
            .where(Order.order_number == order_number)
            .options(selectinload(Order.items), selectinload(Order.payment))
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def filter_orders(
        self,
        user_id: Optional[int] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[Order], int]:
        query = select(Order).options(selectinload(Order.items))
        count_query = select(func.count()).select_from(Order)

        if user_id:
            query = query.where(Order.user_id == user_id)
            count_query = count_query.where(Order.user_id == user_id)

        if status and status.lower() != "all":
            query = query.where(func.lower(Order.status) == status.lower())
            count_query = count_query.where(func.lower(Order.status) == status.lower())

        if search:
            search_cond = (
                Order.order_number.ilike(f"%{search}%")
                | Order.customer_name.ilike(f"%{search}%")
                | Order.customer_email.ilike(f"%{search}%")
                | Order.shipping_address.ilike(f"%{search}%")
            )
            query = query.where(search_cond)
            count_query = count_query.where(search_cond)

        total_res = await self.db.execute(count_query)
        total = total_res.scalar() or 0

        query = query.order_by(desc(Order.created_at)).offset(skip).limit(limit)
        items_res = await self.db.execute(query)
        return list(items_res.scalars().all()), total
