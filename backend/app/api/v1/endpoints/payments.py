from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status, Header, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_admin_user, get_current_staff_or_admin
from app.models.user import User
from app.schemas.payment_accounts import (
    PaymentProviderResponse,
    PaymentProviderUpdate,
    PaymentTransactionResponse,
    PaymentTransactionCreate,
    PaymentVerifyRequest,
    PaymentVerifyResponse,
    RefundRequest,
    WebhookPayload,
)
from app.services.payment_accounts_service import PaymentAccountsService

router = APIRouter(prefix="/payments", tags=["Payment Accounts"])


# ==================== PROVIDERS ====================
@router.get("/providers", response_model=List[PaymentProviderResponse])
async def list_payment_providers(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_staff_or_admin),
):
    service = PaymentAccountsService(db)
    return await service.list_providers()


@router.put("/providers/{provider_code}", response_model=PaymentProviderResponse)
async def update_payment_provider(
    provider_code: str,
    req: PaymentProviderUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    service = PaymentAccountsService(db)
    return await service.update_provider(provider_code, req)


# ==================== TRANSACTIONS ====================
@router.get("", response_model=dict)
async def list_payment_transactions(
    provider: Optional[str] = Query(None, description="Provider filter (aba_payway, khqr_bakong, acleda)"),
    status: Optional[str] = Query(None, description="Status filter (PENDING, PAID, FAILED, REFUNDED, etc.)"),
    search: Optional[str] = Query(None, description="Search txn ID, customer, order number"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_staff_or_admin),
):
    service = PaymentAccountsService(db)
    skip = (page - 1) * page_size
    items, total = await service.list_transactions(
        provider_code=provider,
        status_filter=status,
        search=search,
        skip=skip,
        limit=page_size,
    )
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    return {
        "items": [PaymentTransactionResponse.model_validate(t) for t in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.get("/{id}", response_model=PaymentTransactionResponse)
async def get_payment_transaction(
    id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_staff_or_admin),
):
    service = PaymentAccountsService(db)
    return await service.get_transaction(id)


@router.post("", response_model=PaymentTransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_payment_transaction(
    req: PaymentTransactionCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_staff_or_admin),
):
    service = PaymentAccountsService(db)
    return await service.create_transaction(req)


@router.post("/verify", response_model=PaymentVerifyResponse)
async def verify_payment(
    req: PaymentVerifyRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_staff_or_admin),
):
    service = PaymentAccountsService(db)
    res = await service.verify_payment(req.transaction_id, req.provider_code, req.signature)
    return res


@router.post("/{id}/refund", response_model=PaymentTransactionResponse)
async def refund_payment(
    id: int,
    req: RefundRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    service = PaymentAccountsService(db)
    return await service.refund_transaction(id, req)


# ==================== SECURE WEBHOOKS ====================
@router.post("/webhook/{provider_code}")
async def handle_payment_webhook(
    provider_code: str,
    payload: WebhookPayload,
    request: Request,
    db: AsyncSession = Depends(get_db),
    x_signature: Optional[str] = Header(None),
):
    service = PaymentAccountsService(db)
    # Server-side validation of webhook
    tx = await service.process_webhook(payload)
    return {"status": "success", "transaction_id": tx.transaction_id, "state": tx.status}
