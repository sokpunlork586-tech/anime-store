from typing import Optional
import httpx
import jwt
from fastapi import APIRouter, Depends, Header, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, RefreshTokenRequest, Token
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    auth_service = AuthService(db)
    _, token = await auth_service.register(req)
    return token


@router.post("/login", response_model=Token)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    auth_service = AuthService(db)
    _, token = await auth_service.login(req)
    return token


@router.post("/refresh", response_model=Token)
async def refresh_token(req: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    auth_service = AuthService(db)
    return await auth_service.refresh_token(req.refresh_token)


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/firebase-role")
async def resolve_firebase_role(
    authorization: Optional[str] = Header(default=None),
    db: AsyncSession = Depends(get_db),
):
    """
    Verifies a Firebase ID token against Google Identity Toolkit or Google JWK certs
    and returns the user's trusted PostgreSQL role (failing closed to 'customer').
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        return {"role": "customer", "verified": False}

    id_token = authorization.split(" ", 1)[1].strip()
    if not id_token:
        return {"role": "customer", "verified": False}

    firebase_api_key = settings.FIREBASE_API_KEY or settings.VITE_FIREBASE_API_KEY
    firebase_project_id = settings.FIREBASE_PROJECT_ID or settings.VITE_FIREBASE_PROJECT_ID
    verified_email: Optional[str] = None
    claims_role: Optional[str] = None

    try:
        if firebase_api_key:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.post(
                    f"https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={firebase_api_key}",
                    json={"idToken": id_token},
                )
            if resp.status_code == 200:
                users_list = resp.json().get("users") or []
                if users_list:
                    verified_email = users_list[0].get("email")
        elif firebase_project_id:
            jwk_client = jwt.PyJWKClient(
                "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
            )
            signing_key = jwk_client.get_signing_key_from_jwt(id_token)
            decoded = jwt.decode(
                id_token,
                signing_key.key,
                algorithms=["RS256"],
                audience=firebase_project_id,
                issuer=f"https://securetoken.google.com/{firebase_project_id}",
            )
            verified_email = decoded.get("email")
            if decoded.get("admin") is True or str(decoded.get("role", "")).lower() in ("admin", "super_admin"):
                claims_role = "admin"
    except Exception:
        return {"role": "customer", "verified": False}

    if claims_role == "admin":
        return {"role": "admin", "verified": True}

    if verified_email:
        res = await db.execute(select(User).where(User.email == verified_email.lower()))
        db_user = res.scalar_one_or_none()
        if db_user and db_user.is_active and db_user.role in ("admin", "super_admin"):
            return {"role": "admin", "verified": True}
        return {"role": "customer", "verified": True}

    return {"role": "customer", "verified": False}
