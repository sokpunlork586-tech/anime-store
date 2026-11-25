from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_admin_user, get_current_staff_or_admin
from app.models.user import User
from app.schemas.financial_accounts import (
    FinancialAccountCreate,
    FinancialAccountResponse,
    IncomeCreate,
    IncomeResponse,
    ExpenseCreate,
    ExpenseResponse,
    FinancialSummaryResponse,
    FinancialReportsResponse,
)
from app.services.financial_accounts_service import FinancialAccountsService

router = APIRouter(prefix="/financial", tags=["Financial Accounts"])


# ==================== SUMMARY & ACCOUNTS ====================
@router.get("/summary", response_model=FinancialSummaryResponse)
async def get_financial_summary(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_staff_or_admin),
):
    service = FinancialAccountsService(db)
    return await service.get_summary()


@router.get("/accounts", response_model=List[FinancialAccountResponse])
async def list_financial_accounts(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_staff_or_admin),
):
    service = FinancialAccountsService(db)
    return await service.list_accounts()


@router.post("/accounts", response_model=FinancialAccountResponse, status_code=status.HTTP_201_CREATED)
async def create_financial_account(
    req: FinancialAccountCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    service = FinancialAccountsService(db)
    return await service.create_account(req)


# ==================== INCOME ====================
@router.get("/income", response_model=dict)
async def list_income_records(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_staff_or_admin),
):
    service = FinancialAccountsService(db)
    skip = (page - 1) * page_size
    items, total = await service.list_income(
        category=category,
        search=search,
        start_date=start_date,
        end_date=end_date,
        skip=skip,
        limit=page_size,
    )
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    return {
        "items": [IncomeResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.post("/income", response_model=IncomeResponse, status_code=status.HTTP_201_CREATED)
async def create_income_record(
    req: IncomeCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_staff_or_admin),
):
    service = FinancialAccountsService(db)
    return await service.create_income(req, user_name=admin.full_name)


# ==================== EXPENSES ====================
@router.get("/expenses", response_model=dict)
async def list_expense_records(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_staff_or_admin),
):
    service = FinancialAccountsService(db)
    skip = (page - 1) * page_size
    items, total = await service.list_expenses(
        category=category,
        search=search,
        start_date=start_date,
        end_date=end_date,
        skip=skip,
        limit=page_size,
    )
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    return {
        "items": [ExpenseResponse.model_validate(e) for e in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.post("/expenses", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def create_expense_record(
    req: ExpenseCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_staff_or_admin),
):
    service = FinancialAccountsService(db)
    return await service.create_expense(req, user_name=admin.full_name)


@router.put("/expenses/{expense_id}", response_model=ExpenseResponse)
async def update_expense_record(
    expense_id: int,
    req: ExpenseCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    service = FinancialAccountsService(db)
    return await service.update_expense(expense_id, req)


# ==================== REPORTS ====================
@router.get("/reports", response_model=FinancialReportsResponse)
async def get_financial_reports(
    period: str = Query("monthly", regex="^(daily|weekly|monthly|yearly)$"),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_staff_or_admin),
):
    service = FinancialAccountsService(db)
    return await service.get_reports(report_type=period)
