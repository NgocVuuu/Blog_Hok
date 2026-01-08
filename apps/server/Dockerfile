# Base image: Use Node 18 (Bullseye)
# This works for both x86 (DigitalOcean default) and ARM
FROM node:18-bullseye

# Install system dependencies for Puppeteer/Chromium
# We install 'chromium' directly which pulls in all necessary libs
RUN apt-get update \
  && apt-get install -y wget gnupg \
  && apt-get install -y chromium \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# Set environment variables for Puppeteer
# Skip downloading local Chromium (saves size and avoids arch mismatch)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
# Point Puppeteer to the installed system Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create logs directory and set permissions
RUN mkdir -p logs uploads \
  && chown -R node:node /app

# Switch to non-root user (Node image comes with 'node' user)
USER node

# Expose port (Matches default PORT in server.js)
EXPOSE 7000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Start the application
CMD ["npm", "start"]
