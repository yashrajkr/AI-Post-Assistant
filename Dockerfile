# Dockerfile for AI Post Assistant backend
# Works on Render, Railway, Fly.io, or any container platform.

FROM node:20-alpine

WORKDIR /app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Expose port (Render injects PORT env var)
ENV PORT=3000
EXPOSE 3000

# Run as non-root user for security
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3000}/api/health || exit 1

CMD ["node", "server.js"]
