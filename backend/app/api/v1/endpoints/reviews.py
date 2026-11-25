from typing import Optional, List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_admin_user, get_current_user
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewStatusUpdate, ReviewResponse
from app.services.review_service import ReviewService

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.get("", response_model=List[ReviewResponse])
async def list_reviews(
    status_filter: Optional[str] = "all",
    db: AsyncSession = Depends(get_db),
):
    service = ReviewService(db)
    return await service.list_all(status_filter)


@router.get("/product/{product_id}", response_model=List[ReviewResponse])
async def get_product_reviews(product_id: int, db: AsyncSession = Depends(get_db)):
    service = ReviewService(db)
    return await service.get_product_reviews(product_id)


@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    req: ReviewCreate,
    db: AsyncSession = Depends(get_db),
):
    service = ReviewService(db)
    return await service.create_review(req)


@router.patch("/{review_id}/status", response_model=ReviewResponse)
async def update_review_status(
    review_id: int,
    req: ReviewStatusUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    service = ReviewService(db)
    return await service.update_status(review_id, req)


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    service = ReviewService(db)
    await service.delete_review(review_id)
    return None
