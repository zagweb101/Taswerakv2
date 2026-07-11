// ====================================================================
// Taswerak — Audit log + notification helpers
// Centralized so every API route uses consistent logging.
// ====================================================================

import { db } from "@/lib/db";
import { sendEmail, EmailPayload } from "@/lib/services/email";

interface AuditInput {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Write a single audit log entry. Silently fails if DB is unavailable
 * (so the main flow doesn't break in dev without DB).
 */
export async function writeAudit(input: AuditInput): Promise<void> {
  try {
    await db.auditLog.create({ data: input as any });
  } catch (err) {
    console.warn("[audit] could not write log:", err);
  }
}

interface NotificationInput {
  userId: string;
  title: string;
  body: string;
  type:
    | "PAYMENT_APPROVED"
    | "PAYMENT_REJECTED"
    | "CRITIQUE_RECEIVED"
    | "CERTIFICATE_ISSUED"
    | "COURSE_UPDATE"
    | "SYSTEM";
  link?: string;
}

/**
 * Create an in-app notification + optionally send email.
 */
export async function notify(
  input: NotificationInput & { email?: { to: string; payload: EmailPayload } }
): Promise<void> {
  try {
    await db.notification.create({ data: input });
  } catch (err) {
    console.warn("[notify] could not create notification:", err);
  }

  if (input.email) {
    try {
      const payload = input.email.payload;
      await sendEmail({ ...payload, to: input.email.to });
    } catch (err) {
      console.warn("[notify] could not send email:", err);
    }
  }
}
