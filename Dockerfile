# ---- Base Stage ----
FROM node:20-slim AS base

# Install required system packages
RUN apt-get update && apt-get install -y \
    ffmpeg \
    wget \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install latest yt-dlp binary
RUN wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy lock files and package manifest
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy entire project
COPY . .

# Build TypeScript → dist/
RUN pnpm build

# Remove development dependencies
RUN pnpm prune --prod


# ---- Final Runtime Image ----
FROM node:20-slim AS runtime

# Install required runtime tools (ffmpeg + yt-dlp)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    wget \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp again (runtime needs it too)
RUN wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/package.json ./package.json

CMD ["node", "dist/app.js"]
