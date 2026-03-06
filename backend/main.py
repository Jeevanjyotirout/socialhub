"""
SocialHub – FastAPI Application Entry Point
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from database.connection import init_db
from api.routes import auth, downloads, captions, dashboard
from middleware.security import SecurityMiddleware
from utils.config import get_settings

settings = get_settings()
limiter  = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="SocialHub API",
    description="Free Social Media Optimizer & Downloader – no paid APIs, no rate limits.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# ── Rate limiting ──────────────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        settings.FRONTEND_URL,
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Security headers ──────────────────────────────────────────────────────────
app.add_middleware(SecurityMiddleware)

# ── Static file serving (downloaded videos) ───────────────────────────────────
os.makedirs("downloads", exist_ok=True)
app.mount("/files", StaticFiles(directory="downloads"), name="files")

# ── Routes ────────────────────────────────────────────────────────────────────
app.include_router(auth.router,      prefix="/api/auth",      tags=["Auth"])
app.include_router(downloads.router, prefix="/api/downloads", tags=["Downloads"])
app.include_router(captions.router,  prefix="/api/captions",  tags=["Captions"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])


# ── Startup ────────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def on_startup():
    await init_db()
    print("✅  SocialHub API is running")
    print(f"📖  Docs: http://localhost:8000/api/docs")


@app.get("/")
async def root():
    return {"service": "SocialHub API", "version": "1.0.0", "status": "ok"}


@app.get("/health")
async def health():
    return {"status": "ok"}
