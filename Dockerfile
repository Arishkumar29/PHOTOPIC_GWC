# ─────────────────────────────────────────────
# GWC PhotoPic Backend — Dockerfile (Render / Railway)
# Node.js 20 + Python 3.11 + OpenCV (headless)
# ─────────────────────────────────────────────
FROM node:20-slim

# Install Python, pip, and system libs needed by OpenCV
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Make `python` point to python3
RUN ln -sf /usr/bin/python3 /usr/bin/python

# Set environment variables for Python pip install
ENV UV_LINK_MODE=copy
ENV PIP_BREAK_SYSTEM_PACKAGES=1

# Install Python dependencies
COPY requirements.txt ./
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Set working directory
WORKDIR /app

# Copy root repository files
COPY . .

# Install Node.js backend dependencies
WORKDIR /app/backend
RUN npm install

WORKDIR /app
ENV PORT=3000
EXPOSE 3000

# Start the backend API server
CMD ["npx", "tsx", "backend/server.ts"]
