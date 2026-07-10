# ====================================================================
# Taswerak — Dockerfile for Coolify / Hostinger VPS
# Multi-stage build with Bun → standalone Next.js output
#
# Build:  bun install && bunx prisma generate && bun run build
# Start:  bunx prisma migrate deploy && bun .next/standalone/server.js
# ====================================================================

# ---------- 1. Base ----------
FROM oven/bun:1.1 AS base
WORKDIR /app

# ---------- 2. Install deps ----------
FROM base AS deps
COPY package.json bun.lock* ./
COPY prisma ./prisma
RUN bun install --frozen-lockfile

# ---------- 3. Build ----------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN bunx prisma generate
RUN bun run build

# ---------- 4. Production ----------
FROM oven/bun:1.1-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Install openssl (needed by Prisma) + curl (for health checks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy prisma migrations + schema for `prisma migrate deploy`
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Health check — hits /api/health every 30s, unhealthy after 3 failures
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start command: run migrations THEN start server
CMD ["sh", "-c", "bunx prisma migrate deploy && bun server.js"]
