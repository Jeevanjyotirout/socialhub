"""
SocialHub – Security Middleware
• Blocks path traversal / XSS patterns
• Adds standard security headers
• Input sanitization helpers
"""
import re
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

_BLOCKED = [r"\.\./", r"<script", r"javascript:", r"onload=", r"onerror="]


class SecurityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = str(request.url)
        for pattern in _BLOCKED:
            if re.search(pattern, path, re.IGNORECASE):
                return Response("Forbidden", status_code=403)

        response = await call_next(request)
        response.headers.update({
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options":        "DENY",
            "X-XSS-Protection":       "1; mode=block",
            "Referrer-Policy":        "strict-origin-when-cross-origin",
        })
        return response
