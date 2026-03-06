"""
SocialHub – Download Service
Wraps yt-dlp for metadata extraction + video download.
Supports: YouTube, Instagram, TikTok, Twitter/X, Facebook, LinkedIn, Reddit, Quora
"""
from __future__ import annotations
import asyncio
import re
from pathlib import Path
from typing import Any

import yt_dlp

from utils.config import get_settings
from utils.helpers import url_hash

settings   = get_settings()
DOWNLOAD_DIR = Path("downloads")
DOWNLOAD_DIR.mkdir(exist_ok=True)

MAX_BYTES = settings.MAX_FILE_SIZE_MB * 1024 * 1024

# ── Platform detection ────────────────────────────────────────────────────────
_PATTERNS: dict[str, list[str]] = {
    "youtube":   [r"youtube\.com", r"youtu\.be"],
    "instagram": [r"instagram\.com"],
    "tiktok":    [r"tiktok\.com", r"vm\.tiktok\.com"],
    "twitter":   [r"twitter\.com", r"x\.com"],
    "facebook":  [r"facebook\.com", r"fb\.watch"],
    "linkedin":  [r"linkedin\.com"],
    "reddit":    [r"reddit\.com", r"redd\.it"],
    "quora":     [r"quora\.com"],
}

def detect_platform(url: str) -> str:
    u = url.lower()
    for platform, patterns in _PATTERNS.items():
        if any(re.search(p, u) for p in patterns):
            return platform
    return "unknown"


# ── yt-dlp option builders ────────────────────────────────────────────────────
def _base_opts(out_tmpl: str, info_only: bool = False) -> dict:
    return {
        "quiet":           True,
        "no_warnings":     True,
        "format":          f"best[filesize<{MAX_BYTES}]/best",
        "outtmpl":         out_tmpl,
        "max_filesize":    MAX_BYTES,
        "socket_timeout":  30,
        "retries":         3,
        "noplaylist":      True,
        "skip_download":   info_only,
        "postprocessors":  [] if info_only else [{
            "key":             "FFmpegVideoConvertor",
            "preferedformat": "mp4",
        }],
    }


# ── Metadata extraction ───────────────────────────────────────────────────────
async def extract_metadata(url: str) -> dict[str, Any]:
    """Return video metadata without downloading the file."""
    loop = asyncio.get_event_loop()

    def _run():
        with yt_dlp.YoutubeDL(_base_opts("%(id)s.%(ext)s", info_only=True)) as ydl:
            return ydl.extract_info(url, download=False)

    try:
        info = await loop.run_in_executor(None, _run)
    except yt_dlp.utils.DownloadError as exc:
        raise ValueError(str(exc)) from exc

    return _parse_info(info, url)


def _parse_info(info: dict, url: str) -> dict:
    hashtags: list[str] = []
    if info.get("tags"):
        hashtags = [f"#{t.replace(' ', '')}" for t in info["tags"][:20]]
    if desc := info.get("description"):
        found = re.findall(r"#\w+", desc)
        hashtags = list(dict.fromkeys(hashtags + found))[:30]

    formats = []
    seen: set[str] = set()
    for f in info.get("formats") or []:
        label = f"{f.get('ext','?')} {f.get('height','?')}p"
        if label not in seen and f.get("height"):
            seen.add(label)
            formats.append({
                "format_id": f.get("format_id"),
                "ext":       f.get("ext"),
                "height":    f.get("height"),
                "label":     label,
            })
    formats.sort(key=lambda x: x.get("height", 0), reverse=True)

    return {
        "url":        url,
        "platform":   detect_platform(url),
        "title":      (info.get("title") or "")[:500],
        "description":(info.get("description") or "")[:2000],
        "hashtags":   hashtags,
        "thumbnail":  info.get("thumbnail") or "",
        "duration":   int(info.get("duration") or 0),
        "uploader":   info.get("uploader") or "",
        "view_count": int(info.get("view_count") or 0),
        "formats":    formats[:5],
    }


# ── Video download ────────────────────────────────────────────────────────────
async def download_video(url: str, download_id: int) -> dict[str, Any]:
    """Download video to disk; return file details."""
    loop    = asyncio.get_event_loop()
    h       = url_hash(url)
    out_tmpl = str(DOWNLOAD_DIR / f"{download_id}_{h}.%(ext)s")

    def _run():
        with yt_dlp.YoutubeDL(_base_opts(out_tmpl)) as ydl:
            info     = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)
            mp4      = Path(filename).with_suffix(".mp4")
            final    = mp4 if mp4.exists() else Path(filename)
            return info, str(final)

    info, filepath = await loop.run_in_executor(None, _run)
    fp   = Path(filepath)
    size = fp.stat().st_size if fp.exists() else 0

    return {
        "file_path": filepath,
        "file_name": fp.name,
        "file_size": size,
        "title":     (info.get("title") or "")[:500],
        "duration":  int(info.get("duration") or 0),
    }
