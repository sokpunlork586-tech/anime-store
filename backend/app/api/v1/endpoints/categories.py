from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_optional_admin_user
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.services.category_service import CategoryService

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=List[CategoryResponse])
async def get_categories(db: AsyncSession = Depends(get_db)):
    service = CategoryService(db)
    return await service.get_all()


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    req: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    admin: Optional[User] = Depends(get_optional_admin_user),
):
    service = CategoryService(db)
    return await service.create(req)


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: int, db: AsyncSession = Depends(get_db)):
    service = CategoryService(db)
    return await service.get_by_id(category_id)


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    req: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    admin: Optional[User] = Depends(get_optional_admin_user),
):
    service = CategoryService(db)
    return await service.update(category_id, req)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    admin: Optional[User] = Depends(get_optional_admin_user),
):
    service = CategoryService(db)
    await service.delete(category_id)
    return None
