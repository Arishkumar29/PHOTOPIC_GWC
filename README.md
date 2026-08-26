# GWC PhotoPic (FaceSync)

AI-Powered Facial Recognition & Instant Event Photo Discovery Monorepo.

---

## 🏗️ Architecture

```
PHOTOPIC_GWC
│
├── frontend/ ────────────────────────► VERCEL (Frontend Static / SPA)
│     ├── src/                               │
│     │    ├── views/                        │
│     │    ├── components/                   │
│     │    └── lib/api.ts ◄──────────────────┼── Uses VITE_API_URL (HTTPS)
│     ├── package.json                       │
│     └── vite.config.js                     │
│                                            ▼
├── backend/ ─────────────────────────► RENDER / RAILWAY (Backend API Server)
│     ├── server.ts                          │
│     ├── routes/ & controllers/             │
│     ├── scripts/scan_faces.py ◄────────────┼── Python 3.11 + OpenCV Biometrics
│     └── models/ (*.onnx, *.sqlite)         │
│
├── bulk_photo/ ─────────────────────────────┴── Photo Cache Directory
├── Dockerfile ───────────────────────────────── Docker Container (Node 20 + Python 3.11 + OpenCV)
├── requirements.txt ─────────────────────────── Python Requirements (opencv-python-headless, numpy)
├── render.yaml ──────────────────────────────── Render.com Blueprint
├── railway.toml ─────────────────────────────── Railway.app Configuration
└── vercel.json ──────────────────────────────── Vercel Deployment Configuration
```

---

## 🚀 Deployment Guide

### 1. Backend Deployment (Render or Railway)

#### Option A: Render.com
1. Open **[Render Dashboard](https://dashboard.render.com)** $\rightarrow$ **New +** $\rightarrow$ **Web Service**.
2. Connect repo: `Arishkumar29/PHOTOPIC_GWC`.
3. Runtime: **Docker** | Instance: **Free**.
4. Click **Create Web Service**.
5. Copy your Render URL (e.g. `https://photopic-backend.onrender.com`).

#### Option B: Railway.app
1. Open **[Railway Dashboard](https://railway.app)** $\rightarrow$ **New Project** $\rightarrow$ **Deploy from GitHub repo**.
2. Connect `Arishkumar29/PHOTOPIC_GWC`.
3. Generate domain under **Settings $\rightarrow$ Networking**.

---

### 2. Frontend Deployment (Vercel)
1. Open **[Vercel Dashboard](https://vercel.com/dashboard)** $\rightarrow$ select your `photopic-gwc` project.
2. Go to **Settings** $\rightarrow$ **Environment Variables**.
3. Add:
   - `VITE_API_URL` = `https://your-backend-url.onrender.com` (no trailing slash).
4. Go to **Deployments** $\rightarrow$ click **`...`** $\rightarrow$ **Redeploy**.

---

## 💻 Local Development

```bash
# Start local backend dev server (Express + OpenCV API on port 3000)
npm run dev:backend

# Start local frontend dev server (Vite on port 5173)
npm run dev:frontend
```
