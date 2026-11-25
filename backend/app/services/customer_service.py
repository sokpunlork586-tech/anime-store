from datetime import datetime, timezone
from typing import Optional, List, Tuple
from fastapi import HTTPException, status
from sqlalchemy import select, func, or_, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate


class CustomerService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_customers(
        self,
        search: Optional[str] = None,
        status_filter: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[Customer], int]:
        stmt = select(Customer)
        count_stmt = select(func.count(Customer.id))

        filters = []
        if status_filter and status_filter != "all":
            filters.append(Customer.status == status_filter)
        if search and search.strip():
            q = f"%{search.strip().lower()}%"
            filters.append(
                or_(
                    func.lower(Customer.name).like(q),
                    func.lower(Customer.email).like(q),
                    func.lower(Customer.phone).like(q),
                    func.lower(Customer.city).like(q),
                )
            )

        if filters:
            stmt = stmt.where(*filters)
            count_stmt = count_stmt.where(*filters)

        total_res = await self.db.execute(count_stmt)
        total = total_res.scalar() or 0

        stmt = stmt.order_by(Customer.id.desc()).offset(skip).limit(limit)
        res = await self.db.execute(stmt)
        return list(res.scalars().all()), total

    async def get_by_id(self, customer_id: int) -> Customer:
        stmt = select(Customer).where(Customer.id == customer_id)
        res = await self.db.execute(stmt)
        customer = res.scalar_one_or_none()
        if not customer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
        return customer

    async def create_customer(self, req: CustomerCreate) -> Customer:
        email_lower = req.email.strip().lower()
        existing_res = await self.db.execute(
            select(Customer).where(func.lower(Customer.email) == email_lower)
        )
        if existing_res.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A customer with this email already exists",
            )

        customer = Customer(
            name=req.name.strip(),
            email=email_lower,
            phone=req.phone.strip(),
            avatar=req.avatar,
            address=req.address.strip(),
            city=req.city.strip(),
            country=req.country.strip() or "Cambodia",
            status=req.status,
            club_member=req.club_member,
            total_orders=req.total_orders,
            total_spent=req.total_spent,
        )
        self.db.add(customer)
        await self.db.flush()
        await self.db.refresh(customer)
        return customer

    async def update_customer(self, customer_id: int, req: CustomerUpdate) -> Customer:
        customer = await self.get_by_id(customer_id)
        updates = req.model_dump(exclude_unset=True)

        if "email" in updates and updates["email"]:
            email_lower = updates["email"].strip().lower()
            existing_res = await self.db.execute(
                select(Customer).where(
                    func.lower(Customer.email) == email_lower,
                    Customer.id != customer_id,
                )
            )
            if existing_res.scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already in use by another customer",
                )
            updates["email"] = email_lower

        for k, v in updates.items():
            setattr(customer, k, v)

        await self.db.flush()
        await self.db.refresh(customer)
        return customer

    async def delete_customer(self, customer_id: int) -> None:
        customer = await self.get_by_id(customer_id)
        await self.db.delete(customer)
        await self.db.flush()

    async def bulk_delete_customers(self, ids: List[int]) -> int:
        if not ids:
            return 0
        stmt = delete(Customer).where(Customer.id.in_(ids))
        res = await self.db.execute(stmt)
        await self.db.flush()
        return res.rowcount or 0

    async def upsert_from_order(
        self,
        name: str,
        email: str,
        phone: str,
        address: str,
        city: str,
        order_total: float,
    ) -> Customer:
        email_lower = email.strip().lower()
        now = datetime.now(timezone.utc)
        res = await self.db.execute(
            select(Customer).where(func.lower(Customer.email) == email_lower)
        )
        customer = res.scalar_one_or_none()
        if customer:
            customer.total_orders += 1
            customer.total_spent = round(customer.total_spent + order_total, 2)
            customer.last_order_at = now
            if phone:
                customer.phone = phone
            if address:
                customer.address = address
            if city:
                customer.city = city
        else:
            customer = Customer(
                name=name.strip() or "Customer",
                email=email_lower,
                phone=phone or "",
                address=address or "",
                city=city or "",
                country="Cambodia",
                status="active",
                total_orders=1,
                total_spent=round(order_total, 2),
                joined_at=now,
                last_order_at=now,
            )
            self.db.add(customer)
        await self.db.flush()
        return customer
