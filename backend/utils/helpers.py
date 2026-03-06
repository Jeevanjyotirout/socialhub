"""
SocialHub – Shared Utility Helpers
"""
import re
import hashlib


def sanitize_url(url: str) -> str:
    url = url.strip()
    if not url.startswith(("http://", "https://")):
        raise ValueError("URL must start with http:// or https://")
    if len(url) > 2048:
        raise ValueError("URL too long (max 2048 chars)")
    url = re.sub(r"['\";\\<>]", "", url)
    return url


def sanitize_text(text: str, max_length: int = 5000) -> str:
    text = text[:max_length]
    text = re.sub(r"<[^>]+>", "", text)   # strip HTML
    return text.strip()


def url_hash(url: str) -> str:
    return hashlib.md5(url.encode()).hexdigest()[:12]


def format_bytes(size: int) -> str:
    for unit in ["B", "KB", "MB", "GB"]:
        if size < 1024:
            return f"{size:.1f} {unit}"
        size /= 1024
    return f"{size:.1f} TB"


def format_duration(seconds: int) -> str:
    if not seconds:
        return "0:00"
    m, s = divmod(int(seconds), 60)
    h, m = divmod(m, 60)
    if h:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"
