# 🚀 SocialHub — Free Social Media Optimizer & Downloader

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com)
[![Frontend: Next.js](https://img.shields.io/badge/Frontend-Next.js-black.svg)](https://nextjs.org)
[![Downloader: yt-dlp](https://img.shields.io/badge/Downloader-yt--dlp-red.svg)](https://github.com/yt-dlp/yt-dlp)

> **100% Free · No API Keys · Open Source · Self-Hosted**

Download videos, extract captions & hashtags, optimize content with NLP, and share across 8 social platforms — all from one tool.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📥 **Video Downloader** | YouTube, Instagram, TikTok, Twitter/X, Facebook, LinkedIn, Reddit, Quora |
| ✍️ **Caption Optimizer** | Rule-based NLP — 5 tones, hashtag suggestions, engagement scoring |
| 📊 **Dashboard** | Download history, caption library, platform analytics |
| 📚 **Content Library** | Manage videos, captions, hashtags, draft posts |
| 🔗 **Smart Link Detector** | Auto-detects platform from any URL |
| 🚀 **One-Click Share** | Facebook, Twitter, LinkedIn, Reddit, WhatsApp |
| 🔐 **Local Auth** | JWT-based, SQLite, no external services |
| 🌗 **Dark / Light Mode** | Glassmorphism UI with smooth animations |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, TailwindCSS 3, Framer Motion |
| Backend | FastAPI (Python 3.11+), SQLAlchemy, Pydantic v2 |
| Downloader | yt-dlp + ffmpeg |
| NLP | spaCy + NLTK (rule-based, no paid API) |
| Database | SQLite (aiosqlite) |
| Auth | JWT (python-jose + bcrypt) |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+, Node.js 18+, ffmpeg

```bash
# Install ffmpeg
# Ubuntu/Debian:  sudo apt install ffmpeg
# macOS:          brew install ffmpeg
# Windows:        https://ffmpeg.org/download.html
```

### 1. Clone
```bash
git clone https://github.com/YOUR_USERNAME/socialhub.git
cd socialhub
```

### 2. Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
cp .env.example .env                               # edit SECRET_KEY
uvicorn main:app --reload --port 8000
# API docs → http://localhost:8000/api/docs
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env.local                         # NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
# App → http://localhost:3000
```

---

## 📁 Project Structure

```
socialhub/
├── backend/
│   ├── main.py                  # FastAPI entry point
│   ├── requirements.txt
│   ├── .env.example
│   ├── api/routes/
│   │   ├── auth.py              # POST /login  POST /register  GET /me
│   │   ├── downloads.py         # POST /info   POST /  GET /  DELETE /{id}
│   │   ├── captions.py          # POST /optimize  GET /  DELETE /{id}
│   │   └── dashboard.py         # GET /stats  GET /recent
│   ├── services/
│   │   ├── downloader.py        # yt-dlp wrapper + platform detection
│   │   └── nlp_optimizer.py     # Rule-based NLP caption optimizer
│   ├── database/
│   │   └── connection.py        # SQLite models (User, Download, Caption, History)
│   ├── middleware/
│   │   └── security.py          # Rate-limit, headers, sanitization
│   └── utils/
│       ├── config.py            # Settings from .env
│       └── helpers.py           # Shared utilities
│
├── frontend/
│   ├── pages/
│   │   ├── index.js             # Landing page
│   │   ├── downloader.js        # Video downloader
│   │   ├── optimizer.js         # Caption optimizer
│   │   ├── dashboard.js         # User dashboard
│   │   ├── library.js           # Content library
│   │   ├── login.js             # Login
│   │   ├── signup.js            # Register
│   │   ├── settings.js          # Account settings
│   │   ├── 404.js               # Not found
│   │   ├── _app.js              # App wrapper
│   │   └── _document.js         # HTML document
│   ├── components/
│   │   ├── layout/Navbar.js
│   │   ├── layout/Footer.js
│   │   ├── features/URLInput.js
│   │   ├── features/VideoInfoCard.js
│   │   ├── features/DownloadStatus.js
│   │   └── ui/                  # Shared UI primitives
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useDownload.js
│   ├── utils/api.js
│   ├── styles/globals.css
│   └── public/favicon.svg
│
├── index.html                   # Standalone SPA (GitHub Pages)
├── docker-compose.yml
├── .github/workflows/ci.yml
├── render.yaml
└── README.md
```

---

## 🌐 Deployment

### Frontend → Vercel (Free)
```bash
cd frontend && npx vercel --prod
# Set env: NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

### Backend → Render (Free)
1. New Web Service → connect repo → Root: `backend`
2. Build: `pip install -r requirements.txt && python -m spacy download en_core_web_sm`
3. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add env vars: `SECRET_KEY` (generate random), `FRONTEND_URL`

### GitHub Pages (index.html only)
The `index.html` in the root works standalone — just enable GitHub Pages.

### Docker
```bash
docker-compose up --build
```

---

## 📝 License
MIT — free to use, modify, distribute.
