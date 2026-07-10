// ====================================================================
// Taswerak — In-memory rate limiter
// Works for single-instance deployments (Coolify on one VPS).
// For multi-instance, replace with Redis (@upstash/ratelimit).
// ====================================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}

interface RateLimitOptions {
  /** Unique identifier (e.g., IP + endpoint name) */
  key: string;
  /** Maximum number of requests in the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  /** Suggested HTTP status code if blocked */
  statusCode: number;
}

/**
 * Check rate limit for a given key.
 * Returns success=true if the request is allowed, false if blocked.
 *
 * Example:
 *   const rl = rateLimit({ key: `signup:${ip}`, limit: 5, windowMs: 60 * 60 * 1000 });
 *   if (!rl.success) return NextResponse.json({ error: "too many requests" }, { status: 429 });
 */
export function rateLimit({ key, limit, windowMs }: RateLimitOptions): RateLimitResult {
  cleanup();
  const now = Date.now();

  const existing = store.get(key);
  if (!existing || now > existing.resetAt) {
    // New window
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      success: true,
      remaining: limit - 1,
      resetAt,
      statusCode: 200,
    };
  }

  if (existing.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: existing.resetAt,
      statusCode: 429,
    };
  }

  existing.count++;
  return {
    success: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
    statusCode: 200,
  };
}

/**
 * Extract client IP from request, accounting for proxies.
 */
export function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

/**
 * Pre-configured rate limit presets.
 */
export const rateLimitPresets = {
  /** 5 signups per hour per IP */
  signup: (ip: string) => rateLimit({ key: `signup:${ip}`, limit: 5, windowMs: 60 * 60 * 1000 }),
  /** 10 login attempts per minute per IP */
  login: (ip: string) => rateLimit({ key: `login:${ip}`, limit: 10, windowMs: 60 * 1000 }),
  /** 20 payment uploads per hour per user */
  paymentUpload: (userId: string) => rateLimit({ key: `payupload:${userId}`, limit: 20, windowMs: 60 * 60 * 1000 }),
  /** 3 finance exports per hour per admin */
  financeExport: (userId: string) => rateLimit({ key: `export:${userId}`, limit: 3, windowMs: 60 * 60 * 1000 }),
  /** 10 impersonation starts per hour per admin */
  impersonate: (userId: string) => rateLimit({ key: `impersonate:${userId}`, limit: 10, windowMs: 60 * 60 * 1000 }),
} as const;
