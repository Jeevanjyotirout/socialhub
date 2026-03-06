"""
SocialHub – Database Models & Connection
SQLite via SQLAlchemy (async)
"""
from __future__ import annotations
from sqlalchemy.ext.asyncio import (
    create_async_engine, AsyncSession, async_sessionmaker
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, DateTime, Text, ForeignKey, Boolean, func
from datetime import datetime
from utils.config import get_settings

settings = get_settings()

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False},
)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


# ── Users ─────────────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id:         Mapped[int]      = mapped_column(Integer, primary_key=True, index=True)
    email:      Mapped[str]      = mapped_column(String(255), unique=True, index=True, nullable=False)
    username:   Mapped[str]      = mapped_column(String(100), unique=True, index=True, nullable=False)
    password:   Mapped[str]      = mapped_column(String(255), nullable=False)
    is_active:  Mapped[bool]     = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    downloads: Mapped[list[Download]] = relationship("Download", back_populates="user", cascade="all, delete")
    captions:  Mapped[list[Caption]]  = relationship("Caption",  back_populates="user", cascade="all, delete")
    history:   Mapped[list[History]]  = relationship("History",  back_populates="user", cascade="all, delete")


# ── Downloads ─────────────────────────────────────────────────────────────────
class Download(Base):
    __tablename__ = "downloads"

    id:          Mapped[int]           = mapped_column(Integer, primary_key=True, index=True)
    user_id:     Mapped[int | None]    = mapped_column(ForeignKey("users.id"), nullable=True)
    url:         Mapped[str]           = mapped_column(Text, nullable=False)
    platform:    Mapped[str]           = mapped_column(String(50), nullable=False)
    title:       Mapped[str | None]    = mapped_column(Text)
    description: Mapped[str | None]    = mapped_column(Text)
    hashtags:    Mapped[str | None]    = mapped_column(Text)   # JSON list
    thumbnail:   Mapped[str | None]    = mapped_column(Text)
    file_path:   Mapped[str | None]    = mapped_column(Text)
    file_name:   Mapped[str | None]    = mapped_column(Text)
    file_size:   Mapped[int | None]    = mapped_column(Integer)
    duration:    Mapped[int | None]    = mapped_column(Integer)
    uploader:    Mapped[str | None]    = mapped_column(Text)
    view_count:  Mapped[int | None]    = mapped_column(Integer)
    status:      Mapped[str]           = mapped_column(String(50), default="pending")
    error_msg:   Mapped[str | None]    = mapped_column(Text)
    created_at:  Mapped[datetime]      = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User | None] = relationship("User", back_populates="downloads")


# ── Captions ──────────────────────────────────────────────────────────────────
class Caption(Base):
    __tablename__ = "captions"

    id:          Mapped[int]           = mapped_column(Integer, primary_key=True, index=True)
    user_id:     Mapped[int | None]    = mapped_column(ForeignKey("users.id"), nullable=True)
    original:    Mapped[str]           = mapped_column(Text, nullable=False)
    optimized:   Mapped[str | None]    = mapped_column(Text)
    tone:        Mapped[str | None]    = mapped_column(String(50))
    hashtags:    Mapped[str | None]    = mapped_column(Text)   # JSON list
    platform:    Mapped[str | None]    = mapped_column(String(50))
    score:       Mapped[int | None]    = mapped_column(Integer)
    created_at:  Mapped[datetime]      = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User | None] = relationship("User", back_populates="captions")


# ── History ───────────────────────────────────────────────────────────────────
class History(Base):
    __tablename__ = "history"

    id:         Mapped[int]      = mapped_column(Integer, primary_key=True, index=True)
    user_id:    Mapped[int]      = mapped_column(ForeignKey("users.id"), nullable=False)
    action:     Mapped[str]      = mapped_column(String(50))   # download | optimize | share
    detail:     Mapped[str]      = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship("User", back_populates="history")


# ── Helpers ───────────────────────────────────────────────────────────────────
async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
