// ====================================================================
// GET /api/health
// Health check endpoint for Coolify / Docker / load balancers.
// Returns 200 if app is healthy, 503 if any critical dependency is down.
// ====================================================================

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface HealthCheck {
  name: string;
  status: "ok" | "down";
  latencyMs?: number;
  error?: string;
}

export async function GET() {
  const checks: HealthCheck[] = [];
  const startedAt = Date.now();

  // Check 1: Database connectivity
  const dbStart = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    checks.push({
      name: "database",
      status: "ok",
      latencyMs: Date.now() - dbStart,
    });
  } catch (err: any) {
    checks.push({
      name: "database",
      status: "down",
      latencyMs: Date.now() - dbStart,
      error: err?.message?.slice(0, 100) || "DB unreachable",
    });
  }

  // Check 2: MinIO / object storage (lightweight — just check env configured)
  const minioConfigured = !!(
    process.env.MINIO_ENDPOINT &&
    process.env.MINIO_ACCESS_KEY &&
    process.env.MINIO_SECRET_KEY
  );
  checks.push({
    name: "storage_config",
    status: minioConfigured ? "ok" : "down",
    error: minioConfigured ? undefined : "MINIO_* env vars missing",
  });

  // Check 3: Auth secret configured
  const authConfigured = !!(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET);
  checks.push({
    name: "auth_config",
    status: authConfigured ? "ok" : "down",
    error: authConfigured ? undefined : "AUTH_SECRET missing",
  });

  // Overall status — if DB is down, app is unhealthy
  const dbHealthy = checks.find((c) => c.name === "database")?.status === "ok";
  const overallStatus = dbHealthy ? "ok" : "down";
  const httpStatus = dbHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime_seconds: Math.floor(process.uptime()),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      total_latency_ms: Date.now() - startedAt,
      checks,
    },
    { status: httpStatus }
  );
}
