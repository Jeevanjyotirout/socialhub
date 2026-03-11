"""
SocialHub – Downloads Routes
POST /api/downloads/info    → extract metadata (no download)
POST /api/downloads/        → start download (background)
GET  /api/downloads/{id}/status → poll status
GET  /api/downloads/        → list user's downloads
DELETE /api/downloads/{id}  → delete download + file
"""
from __future__ import annotations
import json
import os
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address

from database.connection import get_db, Download
from services.downloader import extract_metadata, download_video, detect_platform
from api.routes.auth import get_current_user, _token_from_header
from utils.helpers import sanitize_url

router  = APIRouter()
limiter = Limiter(key_func=get_remote_address)


class URLBody(BaseModel):
    url: str


# ── Info (no download) ────────────────────────────────────────────────────────
@router.post("/info")
@limiter.limit("20/minute")
async def get_info(request: Request, body: URLBody):
    try:
        url  = sanitize_url(body.url)
        meta = await extract_metadata(url)
        return {"success": True, "data": meta}
    except ValueError as exc:
        raise HTTPException(422, str(exc))
    except Exception as exc:
        raise HTTPException(500, f"Extraction failed: {exc}")


# ── Start download ────────────────────────────────────────────────────────────
@router.post("/", status_code=202)
@limiter.limit("5/minute")
async def start_download(
    request:    Request,
    body:       URLBody,
    bg:         BackgroundTasks,
    db:         AsyncSession = Depends(get_db),
):
    try:
        url = sanitize_url(body.url)
    except ValueError as exc:
        raise HTTPException(400, str(exc))

    platform = detect_platform(url)
    if platform == "unknown":
        raise HTTPException(400, "Unsupported or unrecognised URL")

    # Optional auth
    user_id = None
    token   = _token_from_header(request)
    if token:
        try:
            user    = await get_current_user(token, db)
            user_id = user.id
        except Exception:
            pass

    dl = Download(user_id=user_id, url=url, platform=platform, status="pending")
    db.add(dl)
    await db.commit()
    await db.refresh(dl)

    bg.add_task(_process, dl.id, url)
    return {"success": True, "download_id": dl.id, "status": "pending"}


# ── Poll status ────────────────────────────────────────────────────────────────
@router.get("/{download_id}/status")
async def poll_status(download_id: int, db: AsyncSession = Depends(get_db)):
    r  = await db.execute(select(Download).where(Download.id == download_id))
    dl = r.scalar_one_or_none()
    if not dl:
        raise HTTPException(404, "Download not found")

    file_url = None
    if dl.file_path and Path(dl.file_path).exists():
        file_url = f"/files/{Path(dl.file_path).name}"

    return {
        "id":        dl.id,
        "status":    dl.status,
        "platform":  dl.platform,
        "title":     dl.title,
        "thumbnail": dl.thumbnail,
        "duration":  dl.duration,
        "file_size": dl.file_size,
        "file_url":  file_url,
        "hashtags":  json.loads(dl.hashtags) if dl.hashtags else [],
        "error_msg": dl.error_msg,
    }


# ── List downloads (auth required) ────────────────────────────────────────────
@router.get("/")
async def list_downloads(
    request: Request,
    skip:    int = 0,
    limit:   int = 20,
    db:      AsyncSession = Depends(get_db),
):
    token = _token_from_header(request)
    if not token:
        raise HTTPException(401, "Login required")
    user = await get_current_user(token, db)

    r  = await db.execute(
        select(Download)
        .where(Download.user_id == user.id)
        .order_by(desc(Download.created_at))
        .offset(skip).limit(limit)
    )
    rows = r.scalars().all()

    return [_dl_dict(d) for d in rows]


# ── Delete download ────────────────────────────────────────────────────────────
@router.delete("/{download_id}")
async def delete_download(
    download_id: int,
    request:     Request,
    db:          AsyncSession = Depends(get_db),
):
    token = _token_from_header(request)
    if not token:
        raise HTTPException(401)
    user = await get_current_user(token, db)

    r  = await db.execute(
        select(Download).where(Download.id == download_id, Download.user_id == user.id)
    )
    dl = r.scalar_one_or_none()
    if not dl:
        raise HTTPException(404)

    if dl.file_path and Path(dl.file_path).exists():
        os.remove(dl.file_path)

    await db.delete(dl)
    await db.commit()
    return {"success": True}


# ── Helpers ────────────────────────────────────────────────────────────────────
def _dl_dict(d: Download) -> dict:
    file_url = None
    if d.file_path and Path(d.file_path).exists():
        file_url = f"/files/{Path(d.file_path).name}"
    return {
        "id":         d.id,
        "url":        d.url,
        "platform":   d.platform,
        "title":      d.title,
        "thumbnail":  d.thumbnail,
        "duration":   d.duration,
        "file_size":  d.file_size,
        "file_url":   file_url,
        "status":     d.status,
        "hashtags":   json.loads(d.hashtags) if d.hashtags else [],
        "created_at": d.created_at,
    }


# ── Background task ────────────────────────────────────────────────────────────
async def _process(download_id: int, url: str):
    from database.connection import AsyncSessionLocal
    async with AsyncSessionLocal() as session:
        try:
            meta      = await extract_metadata(url)
            file_info = await download_video(url, download_id)

            r  = await session.execute(select(Download).where(Download.id == download_id))
            dl = r.scalar_one_or_none()
            if dl:
                dl.title       = meta.get("title", "")
                dl.description = meta.get("description", "")
                dl.hashtags    = json.dumps(meta.get("hashtags", []))
                dl.thumbnail   = meta.get("thumbnail", "")
                dl.duration    = meta.get("duration", 0)
                dl.uploader    = meta.get("uploader", "")
                dl.view_count  = meta.get("view_count", 0)
                dl.file_path   = file_info["file_path"]
                dl.file_name   = file_info["file_name"]
                dl.file_size   = file_info["file_size"]
                dl.status      = "completed"
                await session.commit()

        except Exception as exc:
            r  = await session.execute(select(Download).where(Download.id == download_id))
            dl = r.scalar_one_or_none()
            if dl:
                dl.status    = "failed"
                dl.error_msg = str(exc)[:500]
                await session.commit()
                
def check_download_limit(user):

    if user.plan == "free":
        if user.downloads_today >= 5:
            raise Exception("Upgrade to Pro for unlimited downloads")

    return True
