import random
from datetime import datetime, timezone
from typing import Optional, List, Tuple
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.inventory import Inventory, InventoryTransaction
from app.repositories.order_repo import OrderRepository
from app.repositories.product_repo import ProductRepository
from app.schemas.order import OrderCreate, OrderUpdateStatus, OrderResponse
from app.services.customer_service import CustomerService


class OrderService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.order_repo = OrderRepository(db)
        self.product_repo = ProductRepository(db)

    def _generate_order_number(self) -> str:
        rand_num = random.randint(1000, 9999)
        return f"#ORD-{rand_num}"

    async def create_order(self, req: OrderCreate, user_id: Optional[int] = None) -> OrderResponse:
        # Check stock and reserve
        order_number = self._generate_order_number()

        new_order = Order(
            order_number=order_number,
            user_id=user_id,
            customer_name=req.customer_name.strip(),
            customer_email=req.customer_email.strip(),
            customer_phone=req.customer_phone or "",
            shipping_address=req.shipping_address.strip(),
            city=req.city or "",
            payment_method=req.payment_method or "Credit Card",
            subtotal=req.subtotal,
            shipping_fee=req.shipping_fee or 0.0,
            discount=req.discount or 0.0,
            tax=req.tax or 0.0,
            total_amount=req.total_amount,
            status="Pending",
            payment_status="paid" if req.payment_method == "Credit Card" else "pending",
            notes=req.notes or "",
        )
        self.db.add(new_order)
        await self.db.flush()

        # Add items and decrement product stock safely
        for it in req.items:
            clean_product_id = None
            product = None
            if it.product_id is not None:
                candidate_id = None
                if isinstance(it.product_id, int):
                    candidate_id = it.product_id
                elif isinstance(it.product_id, str) and it.product_id.isdigit():
                    candidate_id = int(it.product_id)

                if candidate_id:
                    product = await self.product_repo.get_with_details(candidate_id)
                    if product:
                        clean_product_id = candidate_id

            order_item = OrderItem(
                order_id=new_order.id,
                product_id=clean_product_id,
                product_name=it.product_name,
                series=it.series or "",
                image_url=it.image_url or "",
                price=it.price,
                quantity=it.quantity,
                variant=it.variant or "",
                total=it.total,
            )
            self.db.add(order_item)

            if product:
                prev_stock = product.stock_quantity
                new_stock = max(0, prev_stock - it.quantity)
                product.stock_quantity = new_stock
                product.units_sold += it.quantity

                if product.inventory_record:
                    product.inventory_record.current_stock = new_stock
                    product.inventory_record.status = (
                        "out_of_stock" if new_stock == 0
                        else "low_stock" if new_stock <= product.inventory_record.min_stock
                        else "in_stock"
                    )

                # Log inventory transaction
                trans = InventoryTransaction(
                    product_id=product.id,
                    type="out",
                    quantity=it.quantity,
                    previous_stock=prev_stock,
                    new_stock=new_stock,
                    reason=f"Customer order {order_number}",
                    created_by="System",
                )
                self.db.add(trans)

        await self.db.flush()

        # Upsert customer record in PostgreSQL customers table
        await CustomerService(self.db).upsert_from_order(
            name=req.customer_name,
            email=req.customer_email,
            phone=req.customer_phone or "",
            address=req.shipping_address,
            city=req.city or "",
            order_total=req.total_amount,
        )

        loaded = await self.order_repo.get_with_details(new_order.id)
        return OrderResponse.model_validate(loaded)

    async def get_by_id(self, order_id: int) -> OrderResponse:
        order = await self.order_repo.get_with_details(order_id)
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        return OrderResponse.model_validate(order)

    async def update_status(self, order_id: int, req: OrderUpdateStatus) -> OrderResponse:
        order = await self.order_repo.get_with_details(order_id)
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

        old_status = order.status
        order.status = req.status
        if req.payment_status:
            order.payment_status = req.payment_status
        elif req.status.lower() == "completed":
            order.payment_status = "paid"
        elif req.status.lower() == "cancelled":
            order.payment_status = "refunded"

        # If cancelled, restore stock
        if req.status.lower() == "cancelled" and old_status.lower() != "cancelled":
            for item in order.items:
                if item.product_id:
                    product = await self.product_repo.get_with_details(item.product_id)
                    if product:
                        prev_stock = product.stock_quantity
                        new_stock = prev_stock + item.quantity
                        product.stock_quantity = new_stock
                        product.units_sold = max(0, product.units_sold - item.quantity)
                        if product.inventory_record:
                            product.inventory_record.current_stock = new_stock
                            product.inventory_record.status = (
                                "out_of_stock" if new_stock == 0
                                else "low_stock" if new_stock <= product.inventory_record.min_stock
                                else "in_stock"
                            )
                        trans = InventoryTransaction(
                            product_id=product.id,
                            type="in",
                            quantity=item.quantity,
                            previous_stock=prev_stock,
                            new_stock=new_stock,
                            reason=f"Order {order.order_number} cancelled",
                            created_by="System",
                        )
                        self.db.add(trans)

        await self.db.flush()
        await self.db.refresh(order)
        return OrderResponse.model_validate(order)

    async def filter_orders(self, **kwargs) -> Tuple[List[OrderResponse], int]:
        orders, total = await self.order_repo.filter_orders(**kwargs)
        return [OrderResponse.model_validate(o) for o in orders], total

    async def delete_order(self, order_id: int) -> None:
        order = await self.order_repo.get_with_details(order_id)
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        await self.db.delete(order)
        await self.db.flush()

    async def bulk_delete_orders(self, ids: List[int]) -> int:
        if not ids:
            return 0
        res = await self.db.execute(select(Order).where(Order.id.in_(ids)))
        orders = list(res.scalars().all())
        for order in orders:
            await self.db.delete(order)
        await self.db.flush()
        return len(orders)
