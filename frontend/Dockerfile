# -------------------------------------------------------------
# Stage 1: Build React Vite Client Assets
# -------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Pass backend URL at build time (defaults to /api or local port)
ARG VITE_BACKEND_URL=""
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

RUN npm run build

# -------------------------------------------------------------
# Stage 2: Production Nginx Runtime
# -------------------------------------------------------------
FROM nginx:1.25-alpine AS runner

# Remove default nginx HTML files
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
