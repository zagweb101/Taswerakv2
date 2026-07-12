// ====================================================================
// POST /api/payments/callback/moyasar
// Webhook endpoint for Moyasar payment gateway callbacks.
// Verifies the payment status and activates student enrollment.
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeAudit } from "@/lib/services/audit";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // Extract payment data from Moyasar webhook
    const paymentId = payload?.id;
    const status = payload?.status; // "paid", "failed", etc.
    const metadata = payload?.metadata;
    const amountHalalas = payload?.amount;

    if (!paymentId || !status) {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    // Find the payment record by provider ID
    const payment = await db.payment.findUnique({
      where: { providerId: paymentId },
    });

    if (!payment) {
      console.warn(`[moyasar/callback] Payment not found for providerId: ${paymentId}`);
      // Return 200 to prevent Moyasar from retrying
      return NextResponse.json({ ok: true, message: "Payment not found, acknowledged" });
    }

    // Prevent duplicate processing
    if (payment.status === "PAID") {
      return NextResponse.json({ ok: true, message: "Already processed" });
    }

    if (status === "paid") {
      // Update payment + activate enrollment in a transaction
      await db.$transaction([
        db.payment.update({
          where: { id: payment.id },
          data: { status: "PAID", paidAt: new Date() },
        }),
        db.enrollment.upsert({
          where: {
            studentId_courseId: {
              studentId: payment.userId,
              courseId: payment.courseId,
            },
          },
          create: {
            studentId: payment.userId,
            courseId: payment.courseId,
            status: "ACTIVE",
          },
          update: { status: "ACTIVE" },
        }),
      ]);

      await writeAudit({
        userId: payment.userId,
        action: "PAYMENT_GATEWAY_CONFIRMED",
        entity: "Payment",
        entityId: payment.id,
        metadata: {
          gateway: "moyasar",
          providerId: paymentId,
          amount: amountHalalas ? amountHalalas / 100 : payment.amount,
          courseId: payment.courseId,
        },
      });
    } else if (status === "failed") {
      await db.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });

      await writeAudit({
        userId: payment.userId,
        action: "PAYMENT_GATEWAY_FAILED",
        entity: "Payment",
        entityId: payment.id,
        metadata: { gateway: "moyasar", providerId: paymentId, reason: payload?.source?.message },
      });
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[moyasar/callback] error:", err);
    // Return 200 to prevent infinite retries from Moyasar
    return NextResponse.json({ ok: true, error: "Internal error, acknowledged" });
  }
}
