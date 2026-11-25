from typing import Optional, List, Tuple
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.product import Product
from app.models.product_image import ProductImage
from app.models.inventory import Inventory
from app.repositories.product_repo import ProductRepository
from app.repositories.category_repo import CategoryRepository
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductImageResponse


class ProductService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.product_repo = ProductRepository(db)
        self.category_repo = CategoryRepository(db)

    def _to_response(self, p: Product) -> ProductResponse:
        cat_name = p.category.name if p.category else ""
        images = [
            ProductImageResponse(
                id=img.id,
                image_url=img.image_url,
                is_primary=img.is_primary,
                display_order=img.display_order,
            )
            for img in (p.images or [])
        ]
        return ProductResponse(
            id=p.id,
            sku=p.sku,
            name=p.name,
            slug=p.slug,
            series=p.series,
            category_id=p.category_id,
            category_name=cat_name,
            price=p.price,
            original_price=p.original_price,
            rating=p.rating,
            review_count=p.review_count,
            units_sold=p.units_sold,
            image_url=p.image_url,
            badge=p.badge,
            featured=p.featured,
            is_new_arrival=p.is_new_arrival,
            stock_quantity=p.stock_quantity,
            status=p.status,
            description=p.description,
            specifications=p.specifications or {},
            variants=p.variants or [],
            tags=p.tags or [],
            images=images,
            created_at=p.created_at,
            updated_at=p.updated_at,
        )

    async def get_by_id(self, product_id: int) -> ProductResponse:
        product = await self.product_repo.get_with_details(product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        return self._to_response(product)

    async def get_by_slug(self, slug: str) -> ProductResponse:
        product = await self.product_repo.get_by_slug(slug)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        return self._to_response(product)

    async def create_product(self, req: ProductCreate) -> ProductResponse:
        category = await self.category_repo.get(req.category_id)
        if not category:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category_id")

        existing_sku = await self.product_repo.get_by_sku(req.sku)
        if existing_sku:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="SKU already exists")

        new_prod = Product(
            sku=req.sku.strip(),
            name=req.name.strip(),
            slug=req.slug.strip(),
            series=req.series or "",
            category_id=req.category_id,
            price=req.price,
            original_price=req.original_price,
            rating=req.rating or 0.0,
            review_count=req.review_count or 0,
            units_sold=req.units_sold or 0,
            image_url=req.image_url or (req.images[0] if req.images else ""),
            badge=req.badge,
            featured=req.featured or False,
            is_new_arrival=req.is_new_arrival or False,
            stock_quantity=req.stock_quantity or 0,
            status=req.status or "active",
            description=req.description or "",
            specifications=req.specifications or {},
            variants=req.variants or [],
            tags=req.tags or [],
        )
        created = await self.product_repo.create(new_prod)

        # Attach images if provided
        if req.images:
            for idx, img_url in enumerate(req.images):
                img = ProductImage(
                    product_id=created.id,
                    image_url=img_url,
                    is_primary=(idx == 0),
                    display_order=idx,
                )
                self.db.add(img)

        # Create linked inventory record
        inv_status = "out_of_stock" if created.stock_quantity == 0 else "low_stock" if created.stock_quantity <= 10 else "in_stock"
        inv = Inventory(
            product_id=created.id,
            current_stock=created.stock_quantity,
            min_stock=10,
            max_stock=100,
            status=inv_status,
        )
        self.db.add(inv)
        await self.db.flush()

        loaded = await self.product_repo.get_with_details(created.id)
        return self._to_response(loaded)

    async def update_product(self, product_id: int, req: ProductUpdate) -> ProductResponse:
        product = await self.product_repo.get_with_details(product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        update_dict = req.model_dump(exclude_unset=True)
        images = update_dict.pop("images", None)

        if "sku" in update_dict:
            existing_sku = await self.product_repo.get_by_sku(update_dict["sku"])
            if existing_sku and existing_sku.id != product_id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="SKU already exists")

        for k, v in update_dict.items():
            setattr(product, k, v)

        if images is not None:
            # Replace images
            for img in list(product.images):
                await self.db.delete(img)
            for idx, img_url in enumerate(images):
                new_img = ProductImage(
                    product_id=product.id,
                    image_url=img_url,
                    is_primary=(idx == 0),
                    display_order=idx,
                )
                self.db.add(new_img)

        # Sync inventory if stock_quantity changed
        if "stock_quantity" in update_dict and product.inventory_record:
            inv = product.inventory_record
            inv.current_stock = product.stock_quantity
            inv.status = "out_of_stock" if inv.current_stock == 0 else "low_stock" if inv.current_stock <= inv.min_stock else "in_stock"

        await self.db.flush()
        await self.db.refresh(product)
        return self._to_response(product)

    async def delete_product(self, product_id: int) -> bool:
        product = await self.product_repo.get(product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        return await self.product_repo.delete(product_id)

    async def filter_products(self, **kwargs) -> Tuple[List[ProductResponse], int]:
        products, total = await self.product_repo.filter_products(**kwargs)
        return [self._to_response(p) for p in products], total
