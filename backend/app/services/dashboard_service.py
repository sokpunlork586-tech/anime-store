from datetime import datetime, timedelta, timezone
from typing import List, Tuple
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.order import Order
from app.models.product import Product
from app.models.customer import Customer
from app.schemas.dashboard import (
    DashboardOverviewResponse,
    DashboardStats,
    SalesDataPoint,
    OrderStatusData,
    TopProductResponse,
    RecentOrderSummary,
)


def _calc_growth(current: float, previous: float) -> float:
    if previous <= 0:
        return 100.0 if current > 0 else 0.0
    return round(((current - previous) / previous) * 100, 1)


def _get_period_bounds(time_range: str, now: datetime) -> Tuple[datetime, datetime, datetime]:
    """Return (current_start, previous_start, previous_end) in UTC."""
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    if time_range == "Last 7 Days":
        curr_start = today_start - timedelta(days=6)
        prev_start = curr_start - timedelta(days=7)
        prev_end = curr_start
    elif time_range == "This Month":
        curr_start = today_start.replace(day=1)
        prev_end = curr_start
        prev_month_last_day = curr_start - timedelta(days=1)
        prev_start = prev_month_last_day.replace(day=1)
    elif time_range == "This Year":
        curr_start = today_start.replace(month=1, day=1)
        prev_end = curr_start
        prev_start = curr_start.replace(year=curr_start.year - 1)
    else:  # "Last 30 Days"
        curr_start = today_start - timedelta(days=29)
        prev_start = curr_start - timedelta(days=30)
        prev_end = curr_start
    return curr_start, prev_start, prev_end


class DashboardService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_overview(self, time_range: str = "Last 30 Days") -> DashboardOverviewResponse:
        now = datetime.now(timezone.utc)
        curr_start, prev_start, prev_end = _get_period_bounds(time_range, now)

        # 1. Orders & Revenue in current period vs previous period
        curr_orders_res = await self.db.execute(
            select(Order).where(Order.created_at >= curr_start)
        )
        curr_orders = list(curr_orders_res.scalars().all())

        prev_orders_res = await self.db.execute(
            select(Order).where(Order.created_at >= prev_start, Order.created_at < prev_end)
        )
        prev_orders = list(prev_orders_res.scalars().all())

        total_orders = len(curr_orders)
        prev_total_orders = len(prev_orders)

        total_revenue = round(
            sum(o.total_amount for o in curr_orders if o.status.lower() != "cancelled"), 2
        )
        prev_revenue = round(
            sum(o.total_amount for o in prev_orders if o.status.lower() != "cancelled"), 2
        )

        # 2. Total Products & growth
        total_products = (await self.db.execute(select(func.count(Product.id)))).scalar() or 0
        curr_prods = (
            await self.db.execute(
                select(func.count(Product.id)).where(Product.created_at >= curr_start)
            )
        ).scalar() or 0
        prev_prods = (
            await self.db.execute(
                select(func.count(Product.id)).where(
                    Product.created_at >= prev_start, Product.created_at < prev_end
                )
            )
        ).scalar() or 0

        # 3. Total Customers (from PostgreSQL customers table) & growth
        total_customers = (await self.db.execute(select(func.count(Customer.id)))).scalar() or 0
        curr_custs = (
            await self.db.execute(
                select(func.count(Customer.id)).where(Customer.created_at >= curr_start)
            )
        ).scalar() or 0
        prev_custs = (
            await self.db.execute(
                select(func.count(Customer.id)).where(
                    Customer.created_at >= prev_start, Customer.created_at < prev_end
                )
            )
        ).scalar() or 0

        stats = DashboardStats(
            total_orders=total_orders,
            total_products=total_products,
            total_customers=total_customers,
            total_revenue=total_revenue,
            order_growth=_calc_growth(total_orders, prev_total_orders),
            product_growth=_calc_growth(curr_prods, prev_prods),
            customer_growth=_calc_growth(curr_custs, prev_custs),
            revenue_growth=_calc_growth(total_revenue, prev_revenue),
        )

        # 4. Sales Overview buckets from PostgreSQL orders
        sales_overview = self._build_sales_series(
            time_range, now, curr_start, prev_start, curr_orders, prev_orders
        )

        # 5. Order Status breakdown from PostgreSQL orders in selected period
        status_counts = {"completed": 0, "processing": 0, "pending": 0, "cancelled": 0}
        for o in curr_orders:
            st = o.status.lower()
            if st in ("completed", "delivered"):
                status_counts["completed"] += 1
            elif st in ("processing", "shipped"):
                status_counts["processing"] += 1
            elif st == "cancelled":
                status_counts["cancelled"] += 1
            else:
                status_counts["pending"] += 1

        denom = total_orders if total_orders > 0 else 1
        order_status = [
            OrderStatusData(
                status="Completed",
                count=status_counts["completed"],
                percentage=round((status_counts["completed"] / denom) * 100, 1) if total_orders else 0.0,
                color="#16A34A",
            ),
            OrderStatusData(
                status="Processing",
                count=status_counts["processing"],
                percentage=round((status_counts["processing"] / denom) * 100, 1) if total_orders else 0.0,
                color="#3B82F6",
            ),
            OrderStatusData(
                status="Pending",
                count=status_counts["pending"],
                percentage=round((status_counts["pending"] / denom) * 100, 1) if total_orders else 0.0,
                color="#F59E0B",
            ),
            OrderStatusData(
                status="Cancelled",
                count=status_counts["cancelled"],
                percentage=round((status_counts["cancelled"] / denom) * 100, 1) if total_orders else 0.0,
                color="#A855F7",
            ),
        ]

        # 6. Top Products from PostgreSQL
        top_stmt = (
            select(Product)
            .options(selectinload(Product.category))
            .order_by(desc(Product.units_sold), desc(Product.id))
            .limit(4)
        )
        top_prods = (await self.db.execute(top_stmt)).scalars().all()
        top_products = [
            TopProductResponse(
                id=p.id,
                name=p.name,
                category=p.category.name if p.category else "Collectibles",
                units_sold=p.units_sold,
                image_url=p.image_url,
                price=p.price,
            )
            for p in top_prods
        ]

        # 7. Recent Orders from PostgreSQL
        recent_stmt = (
            select(Order)
            .where(Order.created_at >= curr_start)
            .order_by(desc(Order.created_at), desc(Order.id))
            .limit(5)
        )
        recent_rows = (await self.db.execute(recent_stmt)).scalars().all()
        recent_orders = [
            RecentOrderSummary(
                id=o.id,
                order_number=o.order_number,
                customer_name=o.customer_name,
                customer_email=o.customer_email,
                total_amount=o.total_amount,
                status=o.status,
                created_at=o.created_at,
            )
            for o in recent_rows
        ]

        return DashboardOverviewResponse(
            stats=stats,
            sales_overview=sales_overview,
            order_status=order_status,
            top_products=top_products,
            recent_orders=recent_orders,
        )

    def _build_sales_series(
        self,
        time_range: str,
        now: datetime,
        curr_start: datetime,
        prev_start: datetime,
        curr_orders: List[Order],
        prev_orders: List[Order],
    ) -> List[SalesDataPoint]:
        def _as_utc(dt: datetime) -> datetime:
            return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)

        if time_range == "Last 7 Days":
            points: List[SalesDataPoint] = []
            for i in range(7):
                day_start = curr_start + timedelta(days=i)
                day_end = day_start + timedelta(days=1)
                p_start = prev_start + timedelta(days=i)
                p_end = p_start + timedelta(days=1)
                c_sum = sum(
                    o.total_amount
                    for o in curr_orders
                    if o.status.lower() != "cancelled" and day_start <= _as_utc(o.created_at) < day_end
                )
                p_sum = sum(
                    o.total_amount
                    for o in prev_orders
                    if o.status.lower() != "cancelled" and p_start <= _as_utc(o.created_at) < p_end
                )
                points.append(
                    SalesDataPoint(
                        day=day_start.strftime("%a"),
                        this_month=round(c_sum, 2),
                        last_month=round(p_sum, 2),
                    )
                )
            return points

        if time_range == "This Year":
            months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            curr_by_m = {m: 0.0 for m in range(1, 13)}
            prev_by_m = {m: 0.0 for m in range(1, 13)}
            for o in curr_orders:
                if o.status.lower() != "cancelled":
                    curr_by_m[_as_utc(o.created_at).month] += o.total_amount
            for o in prev_orders:
                if o.status.lower() != "cancelled":
                    prev_by_m[_as_utc(o.created_at).month] += o.total_amount
            return [
                SalesDataPoint(
                    day=months[m - 1],
                    this_month=round(curr_by_m[m], 2),
                    last_month=round(prev_by_m[m], 2),
                )
                for m in range(1, 13)
            ]

        # "Last 30 Days" or "This Month" -> 5-day / weekly buckets
        if time_range == "This Month":
            curr_buckets = [0.0, 0.0, 0.0, 0.0, 0.0]
            prev_buckets = [0.0, 0.0, 0.0, 0.0, 0.0]
            for o in curr_orders:
                if o.status.lower() != "cancelled":
                    idx = min(4, (_as_utc(o.created_at).day - 1) // 7)
                    curr_buckets[idx] += o.total_amount
            for o in prev_orders:
                if o.status.lower() != "cancelled":
                    idx = min(4, (_as_utc(o.created_at).day - 1) // 7)
                    prev_buckets[idx] += o.total_amount
            return [
                SalesDataPoint(
                    day=f"Week {i + 1}",
                    this_month=round(curr_buckets[i], 2),
                    last_month=round(prev_buckets[i], 2),
                )
                for i in range(5)
            ]

        # "Last 30 Days": 6 buckets of 5 days each
        points = []
        for i in range(6):
            b_start = curr_start + timedelta(days=i * 5)
            b_end = min(now + timedelta(seconds=1), b_start + timedelta(days=5))
            p_start = prev_start + timedelta(days=i * 5)
            p_end = p_start + timedelta(days=5)
            c_sum = sum(
                o.total_amount
                for o in curr_orders
                if o.status.lower() != "cancelled" and b_start <= _as_utc(o.created_at) < b_end
            )
            p_sum = sum(
                o.total_amount
                for o in prev_orders
                if o.status.lower() != "cancelled" and p_start <= _as_utc(o.created_at) < p_end
            )
            points.append(
                SalesDataPoint(
                    day=b_start.strftime("%b %d"),
                    this_month=round(c_sum, 2),
                    last_month=round(p_sum, 2),
                )
            )
        return points
