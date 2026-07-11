// ====================================================================
// Sentry initialization
// Lazy-loaded only if SENTRY_DSN env var is set
// ====================================================================

let sentryInitialized = false;

export async function initSentry() {
  if (sentryInitialized) return;
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1, // 10% of transactions
      replaysSessionSampleRate: 0.05, // 5% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of error sessions
      environment: process.env.NODE_ENV || "production",
      beforeSend(event) {
        // Don't send events in development
        if (process.env.NODE_ENV === "development") return null;
        // Sanitize sensitive data
        if (event.request?.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
        }
        return event;
      },
    });
    sentryInitialized = true;
  } catch (err) {
    console.warn("[sentry] init failed:", err);
  }
}

/**
 * Manually capture an exception (for non-fatal errors)
 */
export async function captureException(err: Error, context?: Record<string, any>) {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    console.error("[captureException] (no Sentry):", err, context);
    return;
  }
  try {
    const Sentry = await import("@sentry/nextjs");
    if (context) Sentry.captureException(err, { extra: context });
    else Sentry.captureException(err);
  } catch {
    console.error("[captureException] failed to send to Sentry:", err);
  }
}
