# -------------------------------------------------------------
# Stage 1: Dependencies Resolution
# -------------------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app

# Install build dependencies if native addons needed
RUN apk add --no-cache libc6-compat

COPY package*.json ./
RUN npm ci --omit=dev

# -------------------------------------------------------------
# Stage 2: Production Runtime
# -------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Create application uploads directory and assign ownership to non-root node user
RUN mkdir -p /app/uploads && chown -R node:node /app

# Copy production node_modules from deps stage
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .

# Run under secure non-root node user
USER node

EXPOSE 4000

# Container Healthcheck targeting Kubernetes/Docker liveness probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/healthz || exit 1

CMD ["node", "server.js"]
