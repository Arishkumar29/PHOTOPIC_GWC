# ─────────────────────────────────────────────
# GWC PhotoPic Backend — Railway Dockerfile
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

# Set environment variables for production API deployment
ENV UV_LINK_MODE=copy
ENV PIP_BREAK_SYSTEM_PACKAGES=1
ENV NODE_ENV=production
ENV PORT=3000

# Install Python dependencies
COPY requirements.txt ./
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Set working directory
WORKDIR /app

# Copy everything
COPY . .

# Install Node.js backend dependencies
RUN npm install --prefix backend

# Expose port
EXPOSE 3000

# Start the backend
CMD ["npm", "run", "dev", "--prefix", "backend"]
