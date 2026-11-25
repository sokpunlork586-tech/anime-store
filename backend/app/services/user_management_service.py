import logging
from typing import Optional, List, Tuple
from sqlalchemy import select, func, desc, or_
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.core.security import get_password_hash
from app.models.user import User
from app.models.rbac import Role, Permission, RolePermission, UserActivityLog
from app.schemas.user_management import (
    UserCreateAdmin,
    UserUpdateAdmin,
    PasswordResetRequest,
)

logger = logging.getLogger("anime_store.rbac")


class UserManagementService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ==================== ROLES & PERMISSIONS ====================
    async def list_roles(self) -> List[Role]:
        stmt = select(Role).order_by(Role.id)
        res = await self.db.execute(stmt)
        roles = list(res.scalars().all())
        if not roles:
            defaults = [
                Role(name="super_admin", display_name="Super Administrator", description="Full unrestricted system access and user authorization"),
                Role(name="admin", display_name="Administrator", description="Store operations, payments, and financial management"),
                Role(name="staff", display_name="Store Staff", description="Assigned modules only (orders, products, inventory)"),
                Role(name="customer", display_name="Customer", description="Storefront shopping, personal cart and order history"),
            ]
            for r in defaults:
                self.db.add(r)
            await self.db.commit()
            stmt = select(Role).order_by(Role.id)
            res = await self.db.execute(stmt)
            roles = list(res.scalars().all())
        return roles

    async def list_permissions(self) -> List[Permission]:
        stmt = select(Permission).order_by(Permission.module, Permission.code)
        res = await self.db.execute(stmt)
        perms = list(res.scalars().all())
        if not perms:
            defaults = [
                Permission(code="payments:read", name="View Payment Accounts & Txns", module="payments", description="View payment providers and transactions"),
                Permission(code="payments:manage", name="Configure Payment Providers", module="payments", description="Update API credentials and toggle status"),
                Permission(code="payments:refund", name="Issue Payment Refunds", module="payments", description="Authorize and process refunds"),
                Permission(code="financial:read", name="View Financial Accounts & Reports", module="financial", description="View balance, reports, and summary"),
                Permission(code="financial:manage", name="Manage Income & Expenses", module="financial", description="Create, edit, or delete income and expense records"),
                Permission(code="users:read", name="View User Accounts", module="users", description="List users and access logs"),
                Permission(code="users:manage", name="Manage Users & Assign Roles", module="users", description="Create users, edit roles, toggle status, and reset passwords"),
                Permission(code="products:manage", name="Manage Products & Catalog", module="products", description="Create and edit anime figures and items"),
                Permission(code="orders:manage", name="Manage Customer Orders", module="orders", description="Update order fulfillment and status"),
            ]
            for p in defaults:
                self.db.add(p)
            await self.db.commit()
            stmt = select(Permission).order_by(Permission.module, Permission.code)
            res = await self.db.execute(stmt)
            perms = list(res.scalars().all())
        return perms

    # ==================== USERS ====================
    async def list_users(
        self,
        role: Optional[str] = None,
        is_active: Optional[bool] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[User], int]:
        stmt = select(User)
        if role and role != "all":
            stmt = stmt.where(User.role == role)
        if is_active is not None:
            stmt = stmt.where(User.is_active == is_active)
        if search:
            q = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    User.full_name.ilike(q),
                    User.email.ilike(q),
                    User.phone.ilike(q),
                )
            )

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_res = await self.db.execute(count_stmt)
        total = total_res.scalar_one()

        stmt = stmt.order_by(desc(User.created_at)).offset(skip).limit(limit)
        res = await self.db.execute(stmt)
        users = list(res.scalars().all())
        return users, total

    async def get_user_by_id(self, user_id: int) -> User:
        stmt = select(User).where(User.id == user_id)
        res = await self.db.execute(stmt)
        user = res.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User #{user_id} not found")
        return user

    async def create_user(self, req: UserCreateAdmin, current_user_name: str = "Super Admin") -> User:
        # Check duplicate email
        stmt = select(User).where(User.email == req.email.lower().strip())
        res = await self.db.execute(stmt)
        if res.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"User with email '{req.email}' already exists")

        valid_roles = ["super_admin", "admin", "staff", "customer"]
        if req.role not in valid_roles:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid role '{req.role}'")

        user = User(
            email=req.email.lower().strip(),
            hashed_password=get_password_hash(req.password),
            full_name=req.full_name.strip(),
            role=req.role,
            phone=req.phone or "",
            address=req.address or "",
            city=req.city or "",
            is_active=req.is_active,
            club_member=False,
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

        # Log activity
        await self.log_activity(
            user_id=user.id,
            user_email=user.email,
            user_name=user.full_name,
            action="create_user",
            module="users",
            details=f"Created account with role {user.role} by {current_user_name}",
        )

        return user

    async def update_user(self, user_id: int, req: UserUpdateAdmin, current_user_name: str = "Admin") -> User:
        user = await self.get_user_by_id(user_id)
        if req.full_name is not None:
            user.full_name = req.full_name.strip()
        if req.role is not None:
            valid_roles = ["super_admin", "admin", "staff", "customer"]
            if req.role in valid_roles:
                user.role = req.role
        if req.phone is not None:
            user.phone = req.phone
        if req.address is not None:
            user.address = req.address
        if req.city is not None:
            user.city = req.city
        if req.is_active is not None:
            user.is_active = req.is_active

        await self.db.commit()
        await self.db.refresh(user)

        await self.log_activity(
            user_id=user.id,
            user_email=user.email,
            user_name=user.full_name,
            action="update_user",
            module="users",
            details=f"Updated user profile & role to {user.role} by {current_user_name}",
        )
        return user

    async def toggle_status(self, user_id: int, current_user_name: str = "Admin") -> User:
        user = await self.get_user_by_id(user_id)
        user.is_active = not user.is_active
        await self.db.commit()
        await self.db.refresh(user)

        action = "activate_user" if user.is_active else "deactivate_user"
        await self.log_activity(
            user_id=user.id,
            user_email=user.email,
            user_name=user.full_name,
            action=action,
            module="users",
            details=f"Account status set to {'ACTIVE' if user.is_active else 'INACTIVE'} by {current_user_name}",
        )
        return user

    async def reset_password(self, user_id: int, req: PasswordResetRequest, current_user_name: str = "Admin") -> User:
        user = await self.get_user_by_id(user_id)
        user.hashed_password = get_password_hash(req.new_password)
        await self.db.commit()
        await self.db.refresh(user)

        await self.log_activity(
            user_id=user.id,
            user_email=user.email,
            user_name=user.full_name,
            action="reset_password",
            module="users",
            details=f"Password securely reset by {current_user_name}",
        )
        return user

    # ==================== ACTIVITY LOGS ====================
    async def log_activity(
        self,
        user_id: Optional[int],
        user_email: str,
        user_name: str,
        action: str,
        module: str,
        details: str,
        ip_address: str = "127.0.0.1",
    ) -> UserActivityLog:
        log = UserActivityLog(
            user_id=user_id,
            user_email=user_email,
            user_name=user_name,
            action=action,
            module=module,
            details=details,
            ip_address=ip_address,
        )
        self.db.add(log)
        await self.db.commit()
        await self.db.refresh(log)
        return log

    async def list_activity_logs(
        self,
        user_id: Optional[int] = None,
        module: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[UserActivityLog], int]:
        stmt = select(UserActivityLog)
        if user_id:
            stmt = stmt.where(UserActivityLog.user_id == user_id)
        if module and module != "all":
            stmt = stmt.where(UserActivityLog.module == module)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_res = await self.db.execute(count_stmt)
        total = total_res.scalar_one()

        stmt = stmt.order_by(desc(UserActivityLog.created_at)).offset(skip).limit(limit)
        res = await self.db.execute(stmt)
        logs = list(res.scalars().all())
        return logs, total
