# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Install Python, pip, and FFmpeg for yt-dlp
RUN apt-get update && apt-get install -y python3 python3-pip ffmpeg

# Install yt-dlp using pip
RUN pip3 install yt-dlp

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install --prod

# Copy the rest of the application's source code
COPY . .

# Build the TypeScript code
RUN pnpm build

# Command to run the bot
CMD ["node", "dist/app.js"]
