# ============================================================
# Dockerfile - Multi-stage build for Node.js Microservice
# Author: Anish Tiwari | DevOps Engineer
# ============================================================

# ---- Stage 1: Builder ----
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first (layer caching)
COPY package*.json ./

# Install all dependencies (including devDependencies for build/test)
RUN npm ci --only=production

# ---- Stage 2: Production image ----
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling in containers
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeapp -u 1001 -G nodejs

WORKDIR /app

# Copy node_modules from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy application source code
COPY src/ ./src/
COPY package*.json ./

# Set ownership to non-root user
RUN chown -R nodeapp:nodejs /app

# Switch to non-root user
USER nodeapp

# Expose application port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Health check for Docker/orchestrator
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Use dumb-init as entrypoint for graceful shutdown
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "src/app.js"]
