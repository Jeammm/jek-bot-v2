# Use a specific Node.js slim image for a smaller base
FROM node:18-slim

# Install system dependencies:
# - python3 and pip for yt-dlp
# - ffmpeg for audio processing
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp globally using pip
RUN pip3 install yt-dlp

# Set the working directory in the container
WORKDIR /usr/src/app

# Install pnpm, the project's package manager
RUN npm install -g pnpm

# Copy package definition files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies needed for the build step)
RUN pnpm install

# Copy the rest of the application's source code
# A .dockerignore file is used to prevent copying unnecessary files
COPY . .

# Build the TypeScript source code into JavaScript
RUN pnpm build

# Prune development-only dependencies to reduce the final image size
RUN pnpm prune --prod

# Copy the .env.example file. The user will need to provide a .env file
# or use environment variables for configuration.
COPY .env.example .

# Command to run the bot
CMD ["node", "dist/app.js"]
