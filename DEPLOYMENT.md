# 🚀 Deployment Guide

## Option A — Vercel (Frontend) + Render (Backend) — Recommended Free

### Step 1 — Deploy Backend to Render

1. Create account at [render.com](https://render.com)
2. New → **Web Service** → connect your GitHub repo
3. Configure:
   - **Root Directory:** `backend`
   - **Runtime:** Python
   - **Build Command:**
     ```
     pip install -r requirements.txt && python -m spacy download en_core_web_sm
     ```
   - **Start Command:**
     ```
     uvicorn main:app --host 0.0.0.0 --port $PORT
     ```
4. Add environment variables:
   | Key | Value |
   |-----|-------|
   | `SECRET_KEY` | (generate a random 32-char string) |
   | `FRONTEND_URL` | `https://your-app.vercel.app` |
5. Add a **Disk** (for video storage):
   - Name: `socialhub-data`
   - Mount Path: `/var/data`
   - Size: 1 GB (free tier)
6. Update `DATABASE_URL` env var: `sqlite+aiosqlite:////var/data/socialhub.db`
7. Deploy — note your URL: `https://socialhub-api.onrender.com`

> ⚠️ Free Render instances sleep after 15 min of inactivity. First request takes ~30s.  
> Fix: Use [UptimeRobot](https://uptimerobot.com) to ping `/health` every 10 minutes.

---

### Step 2 — Deploy Frontend to Vercel

```bash
cd frontend
npx vercel --prod
```

Set environment variable in Vercel dashboard or CLI:
```
NEXT_PUBLIC_API_URL=https://socialhub-api.onrender.com
```

---

## Option B — Docker (Self-hosted VPS)

```bash
# Copy and configure
cp backend/.env.example backend/.env
# Edit backend/.env — set SECRET_KEY and FRONTEND_URL

# Build and run
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

The app will be available at:
- Frontend: `http://YOUR_VPS_IP:3000`
- Backend:  `http://YOUR_VPS_IP:8000`

Add a reverse proxy (nginx/caddy) for HTTPS.

---

## Option C — GitHub Pages (index.html only)

The standalone `index.html` in the project root works **without any backend**.

1. Go to your GitHub repo → **Settings** → **Pages**
2. Source: **Deploy from branch** → `main` → `/ (root)`
3. Your app will be live at `https://YOUR_USERNAME.github.io/socialhub`

Note: GitHub Pages serves the SPA only. Download & save features require the backend.

---

## Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SECRET_KEY` | ✅ | — | JWT signing key (32+ random chars) |
| `DATABASE_URL` | ❌ | `sqlite+aiosqlite:///./socialhub.db` | DB connection string |
| `FRONTEND_URL` | ❌ | `http://localhost:3000` | CORS allowed origin |
| `MAX_FILE_SIZE_MB` | ❌ | `500` | Max download size |

### Frontend (`frontend/.env.local`)
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | `http://localhost:8000` | Backend API base URL |

---

## Generating a SECRET_KEY

```bash
# Python
python -c "import secrets; print(secrets.token_hex(32))"

# Node
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# openssl
openssl rand -hex 32
```
