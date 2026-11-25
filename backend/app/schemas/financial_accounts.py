from typing import Optional, List, Dict
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class FinancialAccountBase(BaseModel):
    account_name: str
    account_number: str
    bank_name: str
    account_type: str = "checking"
    balance: float = 0.0
    currency: str = "USD"
    is_active: bool = True
    notes: Optional[str] = ""


class FinancialAccountCreate(FinancialAccountBase):
    pass


class FinancialAccountResponse(FinancialAccountBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    updated_at: datetime


class IncomeCreate(BaseModel):
    title: str
    category: str = "Sales"
    amount: float
    currency: str = "USD"
    date: str
    reference_number: Optional[str] = ""
    payment_method: str = "ABA PayWay"
    account_name: str = "Main Store Account"
    notes: Optional[str] = ""


class IncomeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    category: str
    amount: float
    currency: str
    date: str
    reference_number: str
    payment_method: str
    account_name: str
    notes: str
    created_by: str
    created_at: datetime
    updated_at: datetime


class ExpenseCreate(BaseModel):
    title: str
    category: str = "Inventory"
    amount: float
    currency: str = "USD"
    date: str
    payment_method: str = "Bank Transfer"
    account_name: str = "Main Store Account"
    receipt_url: Optional[str] = ""
    notes: Optional[str] = ""


class ExpenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    category: str
    amount: float
    currency: str
    date: str
    payment_method: str
    account_name: str
    receipt_url: str
    notes: str
    created_by: str
    created_at: datetime
    updated_at: datetime


class FinancialSummaryResponse(BaseModel):
    total_revenue: float
    total_expenses: float
    net_profit: float
    available_balance: float
    pending_payments: float
    total_transactions: int
    currency: str = "USD"


class FinancialReportItem(BaseModel):
    period: str
    revenue: float
    expenses: float
    net_profit: float


class FinancialReportsResponse(BaseModel):
    report_type: str  # daily, weekly, monthly, yearly
    total_revenue: float
    total_expenses: float
    net_profit: float
    items: List[FinancialReportItem]
    revenue_by_category: Dict[str, float]
    expenses_by_category: Dict[str, float]
