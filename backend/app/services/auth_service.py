from typing import Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.repositories.user_repo import UserRepository
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
from app.schemas.auth import RegisterRequest, LoginRequest, Token


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)

    async def register(self, req: RegisterRequest) -> Tuple[User, Token]:
        existing = await self.user_repo.get_by_email(req.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists"
            )

        hashed_pw = get_password_hash(req.password)
        new_user = User(
            email=req.email.lower().strip(),
            hashed_password=hashed_pw,
            full_name=req.full_name.strip(),
            phone=req.phone or "",
            address=req.address or "",
            city=req.city or "",
            role="customer",
            is_active=True,
            club_member=False,
        )
        created_user = await self.user_repo.create(new_user)
        access_token = create_access_token(created_user.id)
        refresh_token = create_refresh_token(created_user.id)
        token = Token(access_token=access_token, refresh_token=refresh_token)
        return created_user, token

    async def login(self, req: LoginRequest) -> Tuple[User, Token]:
        user = await self.user_repo.get_by_email(req.email)
        if not user or not verify_password(req.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This account has been deactivated"
            )

        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)
        token = Token(access_token=access_token, refresh_token=refresh_token)
        return user, token

    async def refresh_token(self, refresh_token_str: str) -> Token:
        payload = decode_token(refresh_token_str)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

        user = await self.user_repo.get(int(user_id))
        if not user or not user.is_active:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

        new_access = create_access_token(user.id)
        new_refresh = create_refresh_token(user.id)
        return Token(access_token=new_access, refresh_token=new_refresh)
