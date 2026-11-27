from typing import List, Tuple
from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.category import Category
from app.models.product import Product
from app.repositories.category_repo import CategoryRepository
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse


class CategoryService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.category_repo = CategoryRepository(db)

    async def get_all(self) -> List[CategoryResponse]:
        categories_data = await self.category_repo.get_all_with_counts()
        result = []
        for cat, p_count in categories_data:
            res = CategoryResponse.model_validate(cat)
            res.product_count = p_count
            result.append(res)
        return result

    async def get_by_id(self, category_id: int) -> CategoryResponse:
        cat = await self.category_repo.get(category_id)
        if not cat:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
        # Get count
        stmt = select(func.count(Product.id)).where(Product.category_id == cat.id)
        count_res = await self.db.execute(stmt)
        p_count = count_res.scalar() or 0
        res = CategoryResponse.model_validate(cat)
        res.product_count = p_count
        return res

    async def create(self, req: CategoryCreate) -> CategoryResponse:
        existing = await self.category_repo.get_by_slug(req.slug)
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category slug already exists")

        new_cat = Category(
            name=req.name.strip(),
            slug=req.slug.strip(),
            short_name=(req.short_name or "").strip() or req.name.strip().split()[0],
            description=req.description or "",
            image=req.image or "",
            icon_key=req.icon_key or "Package",
            accent_bg=req.accent_bg or "#FFF0E6",
            status=req.status or "active",
        )
        created = await self.category_repo.create(new_cat)
        await self.db.commit()
        await self.db.refresh(created)
        res = CategoryResponse.model_validate(created)
        res.product_count = 0
        return res

    async def update(self, category_id: int, req: CategoryUpdate) -> CategoryResponse:
        cat = await self.category_repo.get(category_id)
        if not cat:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

        update_data = req.model_dump(exclude_unset=True)
        if "slug" in update_data:
            existing = await self.category_repo.get_by_slug(update_data["slug"])
            if existing and existing.id != category_id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category slug already exists")

        for k, v in update_data.items():
            setattr(cat, k, v)

        await self.db.flush()
        await self.db.commit()
        await self.db.refresh(cat)
        return await self.get_by_id(cat.id)

    async def delete(self, category_id: int) -> bool:
        cat = await self.category_repo.get(category_id)
        if not cat:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
        deleted = await self.category_repo.delete(category_id)
        await self.db.commit()
        return deleted
