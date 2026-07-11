# ====================================================================
# Taswerak — Dockerfile for Coolify (Node 22 + npm)
# Multi-stage build → Next.js standalone output → Node.js runtime
#
# Build:  npm install && npx prisma generate && npm run build
# Start:  npm run db:deploy && node .next/standalone/server.js
# ====================================================================

# ---------- 1. Base (Node 22 LTS) ----------
FROM node:22-bookworm-slim AS base
WORKDIR /app

# Install openssl (Prisma runtime requirement) + curl (health checks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ---------- 2. Install deps ----------
FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci --omit=dev=false || npm install

# ---------- 3. Build ----------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npx prisma generate
RUN npm run build

# ---------- 4. Production (Node 22 slim) ----------
FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Install openssl (needed by Prisma Client at runtime) + curl (health checks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output (Next.js server + traced node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy prisma migrations + schema for `prisma migrate deploy`
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
# Prisma CLI + generated client (needed for migrate deploy at startup)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Health check — hits /api/health every 30s, unhealthy after 3 failures
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start command: apply migrations THEN start Node.js server
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
