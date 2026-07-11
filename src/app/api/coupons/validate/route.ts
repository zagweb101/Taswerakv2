// ====================================================================
// POST /api/coupons/validate
// Body: { code, courseId, amount }
// Returns: { ok, discount, finalAmount } or { ok: false, error }
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  code: z.string().min(1).max(50).transform((s) => s.toUpperCase().trim()),
  courseId: z.string().min(1),
  amount: z.number().min(0),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message || "كوبون غير صحيح" },
        { status: 400 }
      );
    }
    const { code, courseId, amount } = parsed.data;

    const coupon = await db.coupon.findUnique({
      where: { code },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ ok: false, error: "كوبون غير صالح" }, { status: 404 });
    }

    // Check validity period
    const now = new Date();
    if (now < coupon.validFrom) {
      return NextResponse.json({ ok: false, error: "هذا الكوبون لم يبدأ بعد" }, { status: 400 });
    }
    if (coupon.validUntil && now > coupon.validUntil) {
      return NextResponse.json({ ok: false, error: "انتهت صلاحية هذا الكوبون" }, { status: 400 });
    }

    // Check usage limit
    if (coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ ok: false, error: "تم استخدام هذا الكوبون بالكامل" }, { status: 400 });
    }

    // Check course restriction
    if (coupon.courseId && coupon.courseId !== courseId) {
      return NextResponse.json({ ok: false, error: "هذا الكوبون غير صالح لهذه الدورة" }, { status: 400 });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === "PERCENTAGE") {
      discount = Math.round((amount * coupon.value) / 100 * 100) / 100;
    } else {
      // FIXED amount
      discount = Math.min(coupon.value, amount);
    }

    const finalAmount = Math.max(0, amount - discount);

    // Increment usage count
    await db.coupon.update({
      where: { code },
      data: { usedCount: { increment: 1 } },
    });

    return NextResponse.json({
      ok: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount,
        finalAmount,
      },
    });
  } catch (err) {
    console.error("[coupon validate] error:", err);
    return NextResponse.json({ ok: false, error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
