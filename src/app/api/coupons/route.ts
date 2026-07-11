// ====================================================================
// GET    /api/coupons        → List all coupons (admin)
// POST   /api/coupons        → Create coupon (admin)
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { writeAudit } from "@/lib/services/audit";

const createSchema = z.object({
  code: z.string().min(2).max(50).transform((s) => s.toUpperCase().trim()),
  type: z.enum(["PERCENTAGE", "FIXED"]).default("PERCENTAGE"),
  value: z.number().min(1).max(10000),
  validFrom: z.string().optional(),
  validUntil: z.string().optional().nullable(),
  maxUses: z.number().min(1).max(100000).default(100),
  courseId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ ok: false, error: "غير مسجّل" }, { status: 401 });
    if (session.user.role !== "ADMIN") return NextResponse.json({ ok: false, error: "صلاحيات غير كافية" }, { status: 403 });

    const coupons = await db.coupon.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ ok: true, coupons });
  } catch (err) {
    console.error("[coupons GET] error:", err);
    return NextResponse.json({ ok: false, error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ ok: false, error: "غير مسجّل" }, { status: 401 });
    if (session.user.role !== "ADMIN") return NextResponse.json({ ok: false, error: "صلاحيات غير كافية" }, { status: 403 });

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message || "بيانات غير صحيحة" }, { status: 400 });
    }
    const data = parsed.data;

    // Check for duplicate code
    const existing = await db.coupon.findUnique({ where: { code: data.code } });
    if (existing) {
      return NextResponse.json({ ok: false, error: "هذا الكود موجود بالفعل" }, { status: 409 });
    }

    const coupon = await db.coupon.create({
      data: {
        code: data.code,
        type: data.type,
        value: data.value,
        validFrom: data.validFrom ? new Date(data.validFrom) : new Date(),
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        maxUses: data.maxUses,
        courseId: data.courseId || null,
        isActive: data.isActive,
      },
    });

    await writeAudit({
      userId: session.user.id,
      action: "COUPON_CREATE",
      entity: "Coupon",
      entityId: coupon.id,
      metadata: { code: coupon.code, type: coupon.type, value: coupon.value },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
    });

    return NextResponse.json({ ok: true, coupon, message: "تم إنشاء الكوبون بنجاح" });
  } catch (err) {
    console.error("[coupons POST] error:", err);
    return NextResponse.json({ ok: false, error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
