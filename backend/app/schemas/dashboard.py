from datetime import datetime
from typing import List
from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_orders: int
    total_products: int
    total_customers: int
    total_revenue: float
    order_growth: float
    product_growth: float
    customer_growth: float
    revenue_growth: float


class SalesDataPoint(BaseModel):
    day: str
    this_month: float
    last_month: float


class OrderStatusData(BaseModel):
    status: str
    count: int
    percentage: float
    color: str


class TopProductResponse(BaseModel):
    id: int
    name: str
    category: str
    units_sold: int
    image_url: str
    price: float


class RecentOrderSummary(BaseModel):
    id: int
    order_number: str
    customer_name: str
    customer_email: str
    total_amount: float
    status: str
    created_at: datetime


class DashboardOverviewResponse(BaseModel):
    stats: DashboardStats
    sales_overview: List[SalesDataPoint]
    order_status: List[OrderStatusData]
    top_products: List[TopProductResponse]
    recent_orders: List[RecentOrderSummary] = []
