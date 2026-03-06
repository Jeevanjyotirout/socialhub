# 🛠️ Installation Guide

## Prerequisites

| Tool    | Version | Install |
|---------|---------|---------|
| Python  | 3.11+   | [python.org](https://python.org) |
| Node.js | 18+     | [nodejs.org](https://nodejs.org) |
| ffmpeg  | Any     | See below |
| Git     | Any     | [git-scm.com](https://git-scm.com) |

### Install ffmpeg

```bash
# macOS
brew install ffmpeg

# Ubuntu / Debian
sudo apt update && sudo apt install ffmpeg

# Windows  (use Chocolatey)
choco install ffmpeg

# Verify
ffmpeg -version
```

---

## 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/socialhub.git
cd socialhub
```

---

## 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate
source venv/bin/activate          # macOS / Linux
# or
venv\Scripts\activate             # Windows

# Install dependencies
pip install -r requirements.txt

# Download NLP model (only needed once)
python -m spacy download en_core_web_sm

# Copy and edit environment variables
cp .env.example .env
# Open .env and set a strong SECRET_KEY

# Start the server
uvicorn main:app --reload --port 8000
```

✅ API is running at `http://localhost:8000`  
📖 Interactive docs at `http://localhost:8000/api/docs`

---

## 3. Frontend Setup

Open a **new terminal**:

```bash
cd frontend

# Install packages
npm install

# Copy env file
cp .env.example .env.local
# Make sure NEXT_PUBLIC_API_URL=http://localhost:8000

# Start dev server
npm run dev
```

✅ App is running at `http://localhost:3000`

---

## 4. Quick Smoke Test

1. Open `http://localhost:3000`
2. Go to **Downloader**, paste a public YouTube URL
3. Click **Analyze URL** — metadata should appear
4. Go to **Optimizer**, type any text, click **Optimize Caption**
5. Create an account at `/signup` to enable saving

---

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (need 3.11+)
- Make sure venv is activated
- Check for port conflicts: `lsof -i :8000`

### Frontend won't start
- Delete `node_modules` and re-run `npm install`
- Check Node version: `node --version` (need 18+)

### Download fails
- Make sure `ffmpeg` is installed and on your `$PATH`
- Try a different public URL
- Instagram/TikTok may require cookies — see yt-dlp docs

### CORS errors
- Make sure `FRONTEND_URL` in `backend/.env` matches your frontend origin
- In development: `FRONTEND_URL=http://localhost:3000`
