import logging
import random
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
from app.services.notification_service import NotificationService

logger = logging.getLogger("anime_store.orders")


class OrderService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.order_repo = OrderRepository(db)
        self.product_repo = ProductRepository(db)

    def _generate_order_number(self) -> str:
        rand_num = random.randint(1000, 9999)
        return f"#ORD-{rand_num}"

    async def create_order(self, req: OrderCreate, user_id: Optional[int] = None) -> OrderResponse:
        # 1-2. Validate customer information & order items
        customer_name = req.customer_name.strip()
        customer_email = req.customer_email.strip()
        shipping_address = req.shipping_address.strip()
        if not customer_name or not customer_email or not shipping_address:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Customer name, email, and shipping address are required.",
            )
        if not req.items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order must contain at least one item.",
            )

        # 3. Validate product prices & stock using database values
        resolved_items = []
        computed_subtotal = 0.0
        for it in req.items:
            if it.quantity <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid quantity for {it.product_name}.",
                )

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

            if product is not None:
                if product.stock_quantity < it.quantity:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Insufficient stock for {product.name} (available: {product.stock_quantity}).",
                    )
                unit_price = float(product.price)
                item_name = product.name
                item_series = product.series or it.series or ""
                item_image = product.image_url or it.image_url or ""
            else:
                if it.price < 0:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Invalid price for {it.product_name}.",
                    )
                unit_price = float(it.price)
                item_name = it.product_name
                item_series = it.series or ""
                item_image = it.image_url or ""

            line_total = round(unit_price * it.quantity, 2)
            computed_subtotal += line_total
            resolved_items.append(
                {
                    "product": product,
                    "product_id": clean_product_id,
                    "product_name": item_name,
                    "series": item_series,
                    "image_url": item_image,
                    "price": unit_price,
                    "quantity": it.quantity,
                    "variant": it.variant or "",
                    "total": line_total,
                }
            )

        computed_subtotal = round(computed_subtotal, 2)
        shipping_fee = round(float(req.shipping_fee or 0.0), 2)
        discount = round(float(req.discount or 0.0), 2)
        tax = round(float(req.tax or 0.0), 2)
        computed_total = max(0.0, round(computed_subtotal + shipping_fee + tax - discount, 2))

        # 4. Create order in database
        order_number = self._generate_order_number()
        new_order = Order(
            order_number=order_number,
            user_id=user_id,
            customer_name=customer_name,
            customer_email=customer_email,
            customer_phone=req.customer_phone or "",
            shipping_address=shipping_address,
            city=req.city or "",
            payment_method=req.payment_method or "Credit Card",
            subtotal=computed_subtotal,
            shipping_fee=shipping_fee,
            discount=discount,
            tax=tax,
            total_amount=computed_total,
            status="Pending",
            payment_status="paid" if req.payment_method == "Credit Card" else "pending",
            notes=req.notes or "",
        )
        self.db.add(new_order)
        await self.db.flush()

        # 5. Create order items & update stock safely
        low_stock_products: List[Tuple[Product, int]] = []
        for item in resolved_items:
            product = item["product"]
            order_item = OrderItem(
                order_id=new_order.id,
                product_id=item["product_id"],
                product_name=item["product_name"],
                series=item["series"],
                image_url=item["image_url"],
                price=item["price"],
                quantity=item["quantity"],
                variant=item["variant"],
                total=item["total"],
            )
            self.db.add(order_item)

            if product is not None:
                prev_stock = product.stock_quantity
                new_stock = max(0, prev_stock - item["quantity"])
                product.stock_quantity = new_stock
                product.units_sold += item["quantity"]

                if product.inventory_record:
                    product.inventory_record.current_stock = new_stock
                    product.inventory_record.status = (
                        "out_of_stock" if new_stock == 0
                        else "low_stock" if new_stock <= product.inventory_record.min_stock
                        else "in_stock"
                    )

                trans = InventoryTransaction(
                    product_id=product.id,
                    type="out",
                    quantity=item["quantity"],
                    previous_stock=prev_stock,
                    new_stock=new_stock,
                    reason=f"Customer order {order_number}",
                    created_by="System",
                )
                self.db.add(trans)
                if new_stock <= 10:
                    low_stock_products.append((product, new_stock))

        await self.db.flush()

        # Upsert customer record in PostgreSQL customers table
        await CustomerService(self.db).upsert_from_order(
            name=customer_name,
            email=customer_email,
            phone=req.customer_phone or "",
            address=shipping_address,
            city=req.city or "",
            order_total=computed_total,
        )

        # 6. Commit the database transaction BEFORE sending any Telegram notification
        await self.db.commit()
        loaded = await self.order_repo.get_with_details(new_order.id)
        order_response = OrderResponse.model_validate(loaded)

        # 7. Send Telegram notification & save outbox record safely (never fail the committed order)
        try:
            notif_service = NotificationService(self.db)
            await notif_service.notify_new_order(loaded)
            for prod, rem_stock in low_stock_products:
                await notif_service.notify_low_stock(prod, rem_stock)
            await self.db.commit()
        except Exception as exc:
            logger.warning(
                "Post-commit notification workflow failed for order %s: %s",
                loaded.order_number,
                type(exc).__name__,
            )
            try:
                await self.db.rollback()
            except Exception:
                pass

        # 8. Return successful order response to frontend
        return order_response

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

        await self.db.commit()
        loaded = await self.order_repo.get_with_details(order_id)
        order_response = OrderResponse.model_validate(loaded)

        if old_status.lower() != req.status.lower():
            try:
                await NotificationService(self.db).notify_order_status_change(loaded, old_status)
                await self.db.commit()
            except Exception as exc:
                logger.warning(
                    "Post-commit status notification failed for order %s: %s",
                    loaded.order_number,
                    type(exc).__name__,
                )
                try:
                    await self.db.rollback()
                except Exception:
                    pass

        return order_response

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
