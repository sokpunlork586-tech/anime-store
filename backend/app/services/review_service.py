from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.review import Review
from app.models.product import Product
from app.schemas.review import ReviewCreate, ReviewUpdate, ReviewStatusUpdate, ReviewResponse


class ReviewService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_product_reviews(self, product_id: int, status: str = "approved") -> List[ReviewResponse]:
        stmt = (
            select(Review)
            .where(Review.product_id == product_id, Review.status == status)
            .order_by(desc(Review.created_at))
        )
        res = await self.db.execute(stmt)
        reviews = res.scalars().all()
        return [ReviewResponse.model_validate(r) for r in reviews]

    async def list_all(self, status: Optional[str] = None) -> List[ReviewResponse]:
        stmt = select(Review).options(selectinload(Review.product))
        if status and status != "all":
            stmt = stmt.where(Review.status == status)
        stmt = stmt.order_by(desc(Review.created_at))
        res = await self.db.execute(stmt)
        reviews = res.scalars().all()
        result = []
        for r in reviews:
            resp = ReviewResponse.model_validate(r)
            resp.product_name = r.product.name if r.product else ""
            result.append(resp)
        return result

    async def create_review(self, req: ReviewCreate, user_id: Optional[int] = None, user_name: str = "Customer") -> ReviewResponse:
        new_rev = Review(
            product_id=req.product_id,
            user_id=user_id,
            customer_name=req.customer_name or user_name,
            customer_avatar="",
            rating=req.rating,
            title=req.title or "",
            comment=req.comment,
            status="approved",
            verified=True,
            helpful=0,
        )
        self.db.add(new_rev)
        await self.db.flush()
        await self.db.refresh(new_rev)
        return ReviewResponse.model_validate(new_rev)

    async def update_status(self, review_id: int, req: ReviewStatusUpdate) -> ReviewResponse:
        stmt = select(Review).where(Review.id == review_id)
        res = await self.db.execute(stmt)
        review = res.scalar_one_or_none()
        if not review:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
        review.status = req.status
        await self.db.flush()
        await self.db.refresh(review)
        return ReviewResponse.model_validate(review)

    async def delete_review(self, review_id: int) -> bool:
        stmt = select(Review).where(Review.id == review_id)
        res = await self.db.execute(stmt)
        review = res.scalar_one_or_none()
        if not review:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
        await self.db.delete(review)
        await self.db.flush()
        return True
