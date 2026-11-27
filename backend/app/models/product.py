from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import String, Float, Integer, Boolean, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    sku: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(300), unique=True, index=True, nullable=False)
    series: Mapped[str] = mapped_column(String(100), default="", index=True, nullable=False)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id", ondelete="CASCADE"), nullable=False, index=True)

    price: Mapped[float] = mapped_column(Float, nullable=False)
    original_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    rating: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    review_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    units_sold: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    image_url: Mapped[str] = mapped_column(Text, default="", nullable=False)
    badge: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_new_arrival: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="active", nullable=False, index=True)

    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    specifications: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    variants: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    tags: Mapped[list] = mapped_column(JSON, default=list, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan", order_by="ProductImage.display_order")
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")
    inventory_record = relationship("Inventory", back_populates="product", uselist=False, cascade="all, delete-orphan")
    inventory_transactions = relationship("InventoryTransaction", back_populates="product", cascade="all, delete-orphan")
