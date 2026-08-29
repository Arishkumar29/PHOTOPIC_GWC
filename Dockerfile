# ─────────────────────────────────────────────
# GWC PhotoPic Backend — Dockerfile (Render / Railway)
# Node.js 20 + Python 3.11 + OpenCV (headless)
# ─────────────────────────────────────────────
FROM node:20-slim

# Install Python, pip, and system libs needed by OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-dev \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Make `python` point to python3 (required by faceScanService.ts -> spawn("python",...))
RUN ln -sf /usr/bin/python3 /usr/bin/python

# Set pip flags
ENV PIP_BREAK_SYSTEM_PACKAGES=1

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt ./
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Install Node.js backend dependencies
COPY backend/package*.json ./backend/
RUN cd /app/backend && npm install

# Copy entire repo
COPY . .

ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

# Run tsx from the backend dir so it finds its own node_modules
CMD ["node", "/app/backend/node_modules/.bin/tsx", "backend/server.ts"]
