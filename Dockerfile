# ====================================================================
# Taswerak — Dockerfile for Coolify / Hostinger VPS
# Build:  bun install && bunx prisma generate && bun run build
# Start:  bunx prisma migrate deploy && bun .next/standalone/server.js
# ====================================================================

FROM oven/bun:1.1 AS base
WORKDIR /app

# ---------- 1. Install deps ----------
FROM base AS deps
COPY package.json bun.lock* ./
COPY prisma ./prisma
RUN bun install --frozen-lockfile

# ---------- 2. Build ----------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN bunx prisma generate
RUN bun run build

# ---------- 3. Production ----------
FROM oven/bun:1.1-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy prisma migrations + schema for `prisma migrate deploy`
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

EXPOSE 3000

# Start command (per Coolify spec): migrate + serve
CMD ["sh", "-c", "bunx prisma migrate deploy && bun server.js"]
