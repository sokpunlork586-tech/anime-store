from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_optional_admin_user
from app.models.user import User
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.services.product_service import ProductService
from app.utils.pagination import PaginatedResponse

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=PaginatedResponse[ProductResponse])
async def get_products(
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
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    service = ProductService(db)
    skip = (page - 1) * page_size
    items, total = await service.filter_products(
        category_id=category_id,
        category_slug=category_slug,
        status=status,
        search=search,
        featured=featured,
        is_new_arrival=is_new_arrival,
        min_price=min_price,
        max_price=max_price,
        sort_by=sort_by,
        sort_order=sort_order,
        skip=skip,
        limit=page_size,
    )
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    req: ProductCreate,
    db: AsyncSession = Depends(get_db),
    admin: Optional[User] = Depends(get_optional_admin_user),
):
    service = ProductService(db)
    return await service.create_product(req)


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    service = ProductService(db)
    return await service.get_by_id(product_id)


@router.get("/slug/{slug}", response_model=ProductResponse)
async def get_product_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    service = ProductService(db)
    return await service.get_by_slug(slug)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    req: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    admin: Optional[User] = Depends(get_optional_admin_user),
):
    service = ProductService(db)
    return await service.update_product(product_id, req)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    admin: Optional[User] = Depends(get_optional_admin_user),
):
    service = ProductService(db)
    await service.delete_product(product_id)
    return None
