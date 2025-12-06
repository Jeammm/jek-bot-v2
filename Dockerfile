# ---- Base Stage ----
FROM node:20-slim AS base

# Install system packages
RUN apt-get update && apt-get install -y \
    ffmpeg \
    wget \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp
RUN wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
    -O /usr/local/bin/yt-dlp && chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app

# ---- Install pnpm (Official Method — works in Coolify) ----
RUN curl -fsSL https://get.pnpm.io/install.sh | sh - \
    && ln -s /root/.local/share/pnpm/pnpm /usr/local/bin/pnpm
# Add pnpm to PATH
ENV PATH="/root/.local/share/pnpm:${PATH}"

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy project files
COPY . .

# Build project
RUN pnpm build

# Remove dev deps
RUN pnpm prune --prod


# ---- Runtime Image ----
FROM node:20-slim AS runtime

# Install runtime requirements
RUN apt-get update && apt-get install -y \
    ffmpeg \
    wget \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp
RUN wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
    -O /usr/local/bin/yt-dlp && chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/package.json .

CMD ["node", "dist/app.js"]
