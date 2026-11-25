from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_admin_user, get_current_user, get_current_staff_or_admin
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.user_management import (
    UserCreateAdmin,
    UserUpdateAdmin,
    RoleResponse,
    PermissionResponse,
    PasswordResetRequest,
    ActivityLogResponse,
)
from app.services.user_service import UserService
from app.services.user_management_service import UserManagementService

router = APIRouter(prefix="/users", tags=["Users & Accounts"])


# ==================== ROLES & PERMISSIONS ====================
@router.get("/roles", response_model=List[RoleResponse])
async def list_roles(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_staff_or_admin),
):
    service = UserManagementService(db)
    return await service.list_roles()


@router.get("/permissions", response_model=List[PermissionResponse])
async def list_permissions(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_staff_or_admin),
):
    service = UserManagementService(db)
    return await service.list_permissions()


@router.get("/activity/all", response_model=dict)
async def list_all_activities(
    module: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    service = UserManagementService(db)
    skip = (page - 1) * page_size
    items, total = await service.list_activity_logs(module=module, skip=skip, limit=page_size)
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    return {
        "items": [ActivityLogResponse.model_validate(log) for log in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


# ==================== USER LIST & CREATION ====================
@router.get("", response_model=dict)
async def list_users(
    role: Optional[str] = Query(None, description="Filter by role (super_admin, admin, staff, customer)"),
    is_active: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_staff_or_admin),
):
    service = UserManagementService(db)
    skip = (page - 1) * page_size
    items, total = await service.list_users(
        role=role,
        is_active=is_active,
        search=search,
        skip=skip,
        limit=page_size,
    )
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    return {
        "items": [UserResponse.model_validate(u) for u in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    req: UserCreateAdmin,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    service = UserManagementService(db)
    user = await service.create_user(req, current_user_name=admin.full_name)
    return UserResponse.model_validate(user)


@router.get("/customers")
async def list_customers(
    search: Optional[str] = None,
    role: Optional[str] = "customer",
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    service = UserService(db)
    skip = (page - 1) * page_size
    items, total = await service.list_customers(search=search, role=role, skip=skip, limit=page_size)
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_staff_or_admin),
):
    service = UserManagementService(db)
    user = await service.get_user_by_id(user_id)
    return UserResponse.model_validate(user)


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    req: UserUpdateAdmin,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("admin", "super_admin") and current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    service = UserManagementService(db)
    user = await service.update_user(user_id, req, current_user_name=current_user.full_name)
    return UserResponse.model_validate(user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    stmt = select(User).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete your own administrator account")
    await db.delete(user)
    await db.commit()
    return None


@router.patch("/{user_id}/toggle-status", response_model=UserResponse)
async def toggle_user_status(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    service = UserManagementService(db)
    user = await service.toggle_status(user_id, current_user_name=admin.full_name)
    return UserResponse.model_validate(user)


@router.post("/{user_id}/reset-password", response_model=UserResponse)
async def reset_user_password(
    user_id: int,
    req: PasswordResetRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    service = UserManagementService(db)
    user = await service.reset_password(user_id, req, current_user_name=admin.full_name)
    return UserResponse.model_validate(user)


@router.get("/{user_id}/activity", response_model=dict)
async def get_user_activity(
    user_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_staff_or_admin),
):
    service = UserManagementService(db)
    skip = (page - 1) * page_size
    items, total = await service.list_activity_logs(user_id=user_id, skip=skip, limit=page_size)
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    return {
        "items": [ActivityLogResponse.model_validate(log) for log in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }
