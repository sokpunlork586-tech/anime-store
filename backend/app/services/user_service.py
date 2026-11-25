from typing import Optional, List, Tuple
from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.order import Order
from app.repositories.user_repo import UserRepository
from app.schemas.user import UserUpdate, UserResponse
from app.core.security import get_password_hash


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)

    async def get_by_id(self, user_id: int) -> User:
        user = await self.user_repo.get(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user

    async def update_user(self, user_id: int, req: UserUpdate) -> User:
        user = await self.get_by_id(user_id)
        update_data = req.model_dump(exclude_unset=True)

        if "password" in update_data and update_data["password"]:
            update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
        else:
            update_data.pop("password", None)

        if "email" in update_data and update_data["email"]:
            existing = await self.user_repo.get_by_email(update_data["email"])
            if existing and existing.id != user_id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use")

        for k, v in update_data.items():
            setattr(user, k, v)

        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def list_customers(
        self,
        search: Optional[str] = None,
        role: Optional[str] = None,
        skip: int = 0,
        limit: int = 20
    ) -> Tuple[List[dict], int]:
        users, total = await self.user_repo.get_customers(search=search, role=role, skip=skip, limit=limit)
        results = []
        for u in users:
            # Aggregate orders metrics
            stmt = select(func.count(Order.id), func.coalesce(func.sum(Order.total_amount), 0.0)).where(Order.user_id == u.id)
            orders_res = await self.db.execute(stmt)
            orders_count, total_spent = orders_res.one()

            results.append({
                "id": u.id,
                "name": u.full_name,
                "email": u.email,
                "phone": u.phone,
                "address": u.address,
                "city": u.city,
                "role": u.role,
                "is_active": u.is_active,
                "club_member": u.club_member,
                "orders_count": orders_count,
                "total_spent": float(total_spent),
                "joined_at": u.created_at.isoformat(),
            })
        return results, total

    async def toggle_active(self, user_id: int) -> User:
        user = await self.get_by_id(user_id)
        user.is_active = not user.is_active
        await self.db.flush()
        await self.db.refresh(user)
        return user
