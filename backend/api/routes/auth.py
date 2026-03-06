"""
SocialHub – Auth Routes
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
PUT  /api/auth/password
"""
from __future__ import annotations
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr, field_validator
from passlib.context import CryptContext
from jose import JWTError, jwt
from slowapi import Limiter
from slowapi.util import get_remote_address

from database.connection import get_db, User
from utils.config import get_settings

router   = APIRouter()
limiter  = Limiter(key_func=get_remote_address)
pwd_ctx  = CryptContext(schemes=["bcrypt"], deprecated="auto")
settings = get_settings()


# ── Schemas ───────────────────────────────────────────────────────────────────
class RegisterIn(BaseModel):
    email:    EmailStr
    username: str
    password: str

    @field_validator("username")
    @classmethod
    def clean_username(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        if len(v) > 30:
            raise ValueError("Username must be under 30 characters")
        return v

    @field_validator("password")
    @classmethod
    def strong_password(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class LoginIn(BaseModel):
    email:    EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user:         dict


class PasswordChangeIn(BaseModel):
    current_password: str
    new_password:     str


# ── Helpers ───────────────────────────────────────────────────────────────────
def hash_pwd(plain: str) -> str:
    return pwd_ctx.hash(plain)

def verify_pwd(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)

def create_token(user_id: int) -> str:
    exp = datetime.utcnow() + timedelta(minutes=settings.TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": str(user_id), "exp": exp}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

async def get_current_user(token: str, db: AsyncSession) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        uid = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    result = await db.execute(select(User).where(User.id == uid, User.is_active == True))
    user   = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def _token_from_header(request: Request) -> str | None:
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth.split(" ", 1)[1]
    return None


# ── Routes ────────────────────────────────────────────────────────────────────
@router.post("/register", response_model=TokenOut, status_code=201)
@limiter.limit("5/minute")
async def register(request: Request, body: RegisterIn, db: AsyncSession = Depends(get_db)):
    # Check duplicates
    r = await db.execute(select(User).where(User.email == body.email))
    if r.scalar_one_or_none():
        raise HTTPException(400, "Email already registered")
    r = await db.execute(select(User).where(User.username == body.username))
    if r.scalar_one_or_none():
        raise HTTPException(400, "Username already taken")

    user = User(email=body.email, username=body.username, password=hash_pwd(body.password))
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return TokenOut(
        access_token=create_token(user.id),
        user={"id": user.id, "email": user.email, "username": user.username},
    )


@router.post("/login", response_model=TokenOut)
@limiter.limit("10/minute")
async def login(request: Request, body: LoginIn, db: AsyncSession = Depends(get_db)):
    r    = await db.execute(select(User).where(User.email == body.email))
    user = r.scalar_one_or_none()
    if not user or not verify_pwd(body.password, user.password):
        raise HTTPException(401, "Invalid email or password")

    return TokenOut(
        access_token=create_token(user.id),
        user={"id": user.id, "email": user.email, "username": user.username},
    )


@router.get("/me")
async def me(request: Request, db: AsyncSession = Depends(get_db)):
    token = _token_from_header(request)
    if not token:
        raise HTTPException(401, "Not authenticated")
    user = await get_current_user(token, db)
    return {
        "id": user.id, "email": user.email,
        "username": user.username, "created_at": user.created_at,
    }


@router.put("/password")
async def change_password(request: Request, body: PasswordChangeIn, db: AsyncSession = Depends(get_db)):
    token = _token_from_header(request)
    if not token:
        raise HTTPException(401)
    user = await get_current_user(token, db)
    if not verify_pwd(body.current_password, user.password):
        raise HTTPException(400, "Current password is incorrect")
    if len(body.new_password) < 6:
        raise HTTPException(400, "New password must be at least 6 characters")
    user.password = hash_pwd(body.new_password)
    await db.commit()
    return {"success": True, "message": "Password updated"}
