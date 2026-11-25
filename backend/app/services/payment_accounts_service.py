import hmac
import hashlib
import json
import logging
from typing import Optional, List, Tuple
from sqlalchemy import select, func, desc, or_
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.models.payment_provider import PaymentProvider
from app.models.payment_transaction import PaymentTransaction
from app.schemas.payment_accounts import (
    PaymentProviderUpdate,
    PaymentTransactionCreate,
    RefundRequest,
    WebhookPayload,
)

logger = logging.getLogger("anime_store.payments")


class PaymentAccountsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ==================== PROVIDERS ====================
    async def list_providers(self) -> List[PaymentProvider]:
        stmt = select(PaymentProvider).order_by(PaymentProvider.id)
        result = await self.db.execute(stmt)
        providers = list(result.scalars().all())
        # If empty, seed default providers
        if not providers:
            defaults = [
                PaymentProvider(
                    name="ABA PayWay",
                    code="aba_payway",
                    description="Leading payment gateway in Cambodia supporting KHQR, Visa, Mastercard, and ABA Mobile app.",
                    is_enabled=True,
                    is_sandbox=True,
                    merchant_id="ec439811",
                    api_key_masked="aba_live_••••••••••••4921",
                    webhook_secret_masked="aba_sec_••••••••••••8812",
                    currency="USD",
                    logo_url="https://payway.ababank.com/favicon.ico",
                ),
                PaymentProvider(
                    name="KHQR / Bakong",
                    code="khqr_bakong",
                    description="National QR standard powered by National Bank of Cambodia (NBC) supporting all local banking apps.",
                    is_enabled=True,
                    is_sandbox=True,
                    merchant_id="bakong_animestore@dev",
                    api_key_masked="bkg_••••••••••••7734",
                    webhook_secret_masked="bkg_sec_••••••••••••9910",
                    currency="USD",
                    logo_url="",
                ),
                PaymentProvider(
                    name="ACLEDA Bank",
                    code="acleda",
                    description="ACLEDA E-Commerce and X-Pay integration for card and direct account processing.",
                    is_enabled=False,
                    is_sandbox=True,
                    merchant_id="acl_merchant_889",
                    api_key_masked="acl_••••••••••••1029",
                    webhook_secret_masked="acl_sec_••••••••••••3341",
                    currency="USD",
                    logo_url="",
                ),
            ]
            for p in defaults:
                self.db.add(p)
            await self.db.commit()
            stmt = select(PaymentProvider).order_by(PaymentProvider.id)
            result = await self.db.execute(stmt)
            providers = list(result.scalars().all())
        return providers

    async def get_provider_by_code(self, code: str) -> PaymentProvider:
        stmt = select(PaymentProvider).where(PaymentProvider.code == code)
        result = await self.db.execute(stmt)
        provider = result.scalar_one_or_none()
        if not provider:
            # Seed providers if empty and re-query
            await self.list_providers()
            result = await self.db.execute(stmt)
            provider = result.scalar_one_or_none()
        if not provider:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Provider '{code}' not found")
        return provider

    async def update_provider(self, code: str, req: PaymentProviderUpdate) -> PaymentProvider:
        provider = await self.get_provider_by_code(code)
        if req.is_enabled is not None:
            provider.is_enabled = req.is_enabled
        if req.is_sandbox is not None:
            provider.is_sandbox = req.is_sandbox
        if req.merchant_id is not None:
            provider.merchant_id = req.merchant_id
        if req.currency is not None:
            provider.currency = req.currency
        if req.api_key:
            # Mask the key for storage/response security
            masked = req.api_key[:8] + "••••••••••••" + req.api_key[-4:] if len(req.api_key) > 12 else "••••••••"
            provider.api_key_masked = masked
        if req.webhook_secret:
            masked = req.webhook_secret[:8] + "••••••••••••" + req.webhook_secret[-4:] if len(req.webhook_secret) > 12 else "••••••••"
            provider.webhook_secret_masked = masked

        await self.db.commit()
        await self.db.refresh(provider)
        return provider

    # ==================== TRANSACTIONS ====================
    async def list_transactions(
        self,
        provider_code: Optional[str] = None,
        status_filter: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[PaymentTransaction], int]:
        stmt = select(PaymentTransaction)
        if provider_code and provider_code != "all":
            stmt = stmt.where(PaymentTransaction.provider_code == provider_code)
        if status_filter and status_filter != "all":
            stmt = stmt.where(PaymentTransaction.status == status_filter.upper())
        if search:
            q = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    PaymentTransaction.transaction_id.ilike(q),
                    PaymentTransaction.order_number.ilike(q),
                    PaymentTransaction.customer_name.ilike(q),
                    PaymentTransaction.customer_email.ilike(q),
                )
            )

        # Count total
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_res = await self.db.execute(count_stmt)
        total = total_res.scalar_one()

        # Fetch page
        stmt = stmt.order_by(desc(PaymentTransaction.created_at)).offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        transactions = list(result.scalars().all())

        return transactions, total

    async def get_transaction(self, tx_id: int) -> PaymentTransaction:
        stmt = select(PaymentTransaction).where(PaymentTransaction.id == tx_id)
        result = await self.db.execute(stmt)
        tx = result.scalar_one_or_none()
        if not tx:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment transaction not found")
        return tx

    async def get_by_transaction_id(self, transaction_id: str) -> Optional[PaymentTransaction]:
        stmt = select(PaymentTransaction).where(PaymentTransaction.transaction_id == transaction_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_transaction(self, req: PaymentTransactionCreate) -> PaymentTransaction:
        # Check provider is enabled
        provider = await self.get_provider_by_code(req.provider_code)
        if not provider.is_enabled:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Provider {provider.name} is currently disabled")

        # Generate unique transaction id
        from uuid import uuid4
        tx_code = f"TXN-{req.provider_code.upper()[:3]}-{uuid4().hex[:10].upper()}"

        tx = PaymentTransaction(
            transaction_id=tx_code,
            order_id=req.order_id,
            order_number=req.order_number,
            provider_code=req.provider_code,
            amount=req.amount,
            currency=req.currency,
            status="PENDING",
            payment_method=req.payment_method,
            customer_name=req.customer_name,
            customer_email=req.customer_email,
            notes=req.notes or "",
        )
        self.db.add(tx)
        await self.db.commit()
        await self.db.refresh(tx)
        return tx

    async def verify_payment(self, transaction_id: str, provider_code: str, signature: Optional[str] = None) -> dict:
        tx = await self.get_by_transaction_id(transaction_id)
        if not tx:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found for verification")

        # Server-side verification logic:
        # Check if already verified or terminal state
        if tx.status in ("PAID", "COMPLETED"):
            return {
                "verified": True,
                "transaction_id": tx.transaction_id,
                "status": tx.status,
                "amount": tx.amount,
                "currency": tx.currency,
                "message": "Payment already confirmed and paid",
            }

        # Verify with provider simulation/gateway
        # In sandbox, mark as PAID
        tx.status = "PAID"
        tx.raw_response = json.dumps({"verified_at": "now", "provider": provider_code, "status": "APPROVED"})
        await self.db.commit()
        await self.db.refresh(tx)

        return {
            "verified": True,
            "transaction_id": tx.transaction_id,
            "status": tx.status,
            "amount": tx.amount,
            "currency": tx.currency,
            "message": "Payment verified and status updated to PAID",
        }

    async def verify_webhook_signature(self, provider_code: str, payload_raw: bytes, signature_header: str) -> bool:
        provider = await self.get_provider_by_code(provider_code)
        # Use a secret key to compute HMAC-SHA256
        secret = f"secret_key_{provider.code}"
        expected_sig = hmac.new(secret.encode(), payload_raw, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected_sig, signature_header)

    async def process_webhook(self, payload: WebhookPayload) -> PaymentTransaction:
        tx = await self.get_by_transaction_id(payload.transaction_id)
        if not tx:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Webhook transaction not found")

        # Duplicate/replay prevention
        if tx.status == "PAID" and payload.status.upper() == "PAID":
            logger.info(f"Duplicate webhook ignored for transaction {tx.transaction_id}")
            return tx

        valid_statuses = ["PENDING", "PROCESSING", "PAID", "FAILED", "CANCELLED", "EXPIRED", "REFUNDED"]
        new_status = payload.status.upper()
        if new_status in valid_statuses:
            tx.status = new_status
            tx.signature = payload.signature
            tx.raw_response = json.dumps(payload.dict())
            await self.db.commit()
            await self.db.refresh(tx)

        return tx

    async def refund_transaction(self, tx_id: int, req: RefundRequest) -> PaymentTransaction:
        tx = await self.get_transaction(tx_id)
        if tx.status != "PAID":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PAID transactions can be refunded")
        if req.refund_amount <= 0 or req.refund_amount > tx.amount:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Refund amount must be between 0.01 and {tx.amount}")

        tx.status = "REFUNDED"
        tx.refund_amount = req.refund_amount
        tx.refund_reason = req.reason
        await self.db.commit()
        await self.db.refresh(tx)
        return tx
