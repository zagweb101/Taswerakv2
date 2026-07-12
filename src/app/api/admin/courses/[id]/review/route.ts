// ====================================================================
// POST /api/admin/courses/:id/review
// Approve or Reject a course submitted for review.
// Only accessible by role = ADMIN.
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { writeAudit } from "@/lib/services/audit";

const reviewSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  rejectionReason: z.string().max(1000).optional().nullable(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "غير مسجّل" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "صلاحيات غير كافية" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message || "بيانات غير صحيحة" },
        { status: 400 }
      );
    }

    const { action, rejectionReason } = parsed.data;

    const course = await db.course.findUnique({
      where: { id },
    });
    if (!course) {
      return NextResponse.json({ ok: false, error: "الدورة غير موجودة" }, { status: 404 });
    }

    if (action === "REJECT" && (!rejectionReason || rejectionReason.trim() === "")) {
      return NextResponse.json({ ok: false, error: "سبب الرفض مطلوب" }, { status: 400 });
    }

    const data: any = {};
    if (action === "APPROVE") {
      data.status = "PUBLISHED";
      data.isFeatured = course.isFeatured; // keep original value
      data.rejectionReason = null;
      data.reviewedAt = new Date();
      data.reviewedById = session.user.id;
    } else {
      data.status = "REJECTED";
      data.rejectionReason = rejectionReason;
      data.reviewedAt = new Date();
      data.reviewedById = session.user.id;
    }

    const updated = await db.course.update({
      where: { id },
      data,
    });

    await writeAudit({
      userId: session.user.id,
      action: action === "APPROVE" ? "COURSE_APPROVE" : "COURSE_REJECT",
      entity: "Course",
      entityId: id,
      metadata: { action, rejectionReason },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
    });

    return NextResponse.json({ ok: true, course: updated });
  } catch (err) {
    console.error("[course review] error:", err);
    return NextResponse.json({ ok: false, error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
