"""
SocialHub – Dashboard Routes
GET /api/dashboard/stats
GET /api/dashboard/recent
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from database.connection import get_db, Download, Caption
from api.routes.auth import get_current_user, _token_from_header

router = APIRouter()


async def _require_user(request: Request, db: AsyncSession):
    token = _token_from_header(request)
    if not token:
        raise HTTPException(401, "Login required")
    return await get_current_user(token, db)


@router.get("/stats")
async def stats(request: Request, db: AsyncSession = Depends(get_db)):
    user = await _require_user(request, db)

    dl_count  = (await db.execute(select(func.count(Download.id)).where(Download.user_id == user.id))).scalar() or 0
    cap_count = (await db.execute(select(func.count(Caption.id)).where(Caption.user_id  == user.id))).scalar() or 0

    plat_rows = (await db.execute(
        select(Download.platform, func.count(Download.id))
        .where(Download.user_id == user.id)
        .group_by(Download.platform)
    )).all()

    return {
        "total_downloads":       dl_count,
        "total_captions":        cap_count,
        "platforms_used":        len(plat_rows),
        "downloads_by_platform": {row[0]: row[1] for row in plat_rows},
        "user": {
            "id":         user.id,
            "username":   user.username,
            "email":      user.email,
            "created_at": user.created_at,
        },
    }


@router.get("/recent")
async def recent(request: Request, db: AsyncSession = Depends(get_db)):
    import json
    from pathlib import Path

    user = await _require_user(request, db)

    dl_rows  = (await db.execute(
        select(Download).where(Download.user_id == user.id)
        .order_by(desc(Download.created_at)).limit(6)
    )).scalars().all()

    cap_rows = (await db.execute(
        select(Caption).where(Caption.user_id == user.id)
        .order_by(desc(Caption.created_at)).limit(6)
    )).scalars().all()

    return {
        "downloads": [
            {
                "id":         d.id,
                "platform":   d.platform,
                "title":      d.title,
                "thumbnail":  d.thumbnail,
                "status":     d.status,
                "file_url":   f"/files/{Path(d.file_path).name}" if d.file_path and Path(d.file_path).exists() else None,
                "created_at": d.created_at,
            }
            for d in dl_rows
        ],
        "captions": [
            {
                "id":         c.id,
                "original":   c.original[:120],
                "optimized":  (c.optimized or "")[:120],
                "tone":       c.tone,
                "score":      c.score,
                "hashtags":   json.loads(c.hashtags) if c.hashtags else [],
                "created_at": c.created_at,
            }
            for c in cap_rows
        ],
    }
