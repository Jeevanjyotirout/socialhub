"""
SocialHub – Captions Routes
POST /api/captions/optimize
GET  /api/captions/
DELETE /api/captions/{id}
"""
from __future__ import annotations
import json

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address
from typing import Optional

from database.connection import get_db, Caption
from services.nlp_optimizer import optimize_caption
from api.routes.auth import get_current_user, _token_from_header

router  = APIRouter()
limiter = Limiter(key_func=get_remote_address)


class OptimizeBody(BaseModel):
    text:         str
    tone:         str           = "professional"
    platform:     Optional[str] = None
    add_hashtags: bool          = True
    add_emoji:    bool          = True
    save:         bool          = False


@router.post("/optimize")
@limiter.limit("30/minute")
async def optimize(request: Request, body: OptimizeBody, db: AsyncSession = Depends(get_db)):
    if not body.text.strip():
        raise HTTPException(400, "Caption text cannot be empty")
    if len(body.text) > 5000:
        raise HTTPException(400, "Caption too long (max 5000 characters)")

    result = optimize_caption(
        text=body.text,
        tone=body.tone,
        platform=body.platform,
        add_hashtags=body.add_hashtags,
        add_emoji=body.add_emoji,
    )

    if body.save:
        token = _token_from_header(request)
        if token:
            try:
                user = await get_current_user(token, db)
                cap  = Caption(
                    user_id=user.id,
                    original=body.text,
                    optimized=result.get("optimized"),
                    tone=body.tone,
                    hashtags=json.dumps(result.get("hashtags", [])),
                    platform=body.platform,
                    score=result.get("score"),
                )
                db.add(cap)
                await db.commit()
                result["saved"] = True
            except Exception:
                result["saved"] = False

    return {"success": True, "data": result}


@router.get("/")
async def list_captions(
    request: Request,
    skip:    int = 0,
    limit:   int = 30,
    db:      AsyncSession = Depends(get_db),
):
    token = _token_from_header(request)
    if not token:
        raise HTTPException(401, "Login required")
    user = await get_current_user(token, db)

    r    = await db.execute(
        select(Caption)
        .where(Caption.user_id == user.id)
        .order_by(desc(Caption.created_at))
        .offset(skip).limit(limit)
    )
    rows = r.scalars().all()
    return [
        {
            "id":         c.id,
            "original":   c.original,
            "optimized":  c.optimized,
            "tone":       c.tone,
            "hashtags":   json.loads(c.hashtags) if c.hashtags else [],
            "platform":   c.platform,
            "score":      c.score,
            "created_at": c.created_at,
        }
        for c in rows
    ]


@router.delete("/{caption_id}")
async def delete_caption(caption_id: int, request: Request, db: AsyncSession = Depends(get_db)):
    token = _token_from_header(request)
    if not token:
        raise HTTPException(401)
    user = await get_current_user(token, db)

    r   = await db.execute(
        select(Caption).where(Caption.id == caption_id, Caption.user_id == user.id)
    )
    cap = r.scalar_one_or_none()
    if not cap:
        raise HTTPException(404)
    await db.delete(cap)
    await db.commit()
    return {"success": True}
