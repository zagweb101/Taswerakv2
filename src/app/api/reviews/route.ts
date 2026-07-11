// ====================================================================
// POST /api/reviews
// Create a review (only students who completed the course)
// GET  /api/reviews/course?courseId=...
// List published reviews for a course (public)
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { writeAudit } from "@/lib/services/audit";

const createSchema = z.object({
  courseId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().max(2000).optional().default(""),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "غير مسجّل" }, { status: 401 });
    }
    if (session.user.role !== "STUDENT") {
      return NextResponse.json({ ok: false, error: "هذه العملية للطلاب فقط" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message || "بيانات غير صحيحة" },
        { status: 400 }
      );
    }
    const { courseId, rating, comment } = parsed.data;

    // Verify enrollment is COMPLETED
    const enrollment = await db.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId: session.user.id, courseId },
      },
      select: { id: true, status: true },
    });

    if (!enrollment || enrollment.status !== "COMPLETED") {
      return NextResponse.json(
        { ok: false, error: "يمكنك التقييم فقط بعد إكمال الدورة" },
        { status: 403 }
      );
    }

    // Check for existing review
    const existing = await db.review.findFirst({
      where: { studentId: session.user.id, courseId },
    });
    if (existing) {
      // Update existing review
      const updated = await db.review.update({
        where: { id: existing.id },
        data: { rating, comment },
      });
      return NextResponse.json({ ok: true, review: updated, message: "تم تحديث تقييمك" });
    }

    const review = await db.review.create({
      data: {
        studentId: session.user.id,
        courseId,
        name: session.user.name || "طالب",
        rating,
        comment,
        isPublished: true,
      },
    });

    await writeAudit({
      userId: session.user.id,
      action: "REVIEW_CREATE",
      entity: "Review",
      entityId: review.id,
      metadata: { courseId, rating },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
    });

    return NextResponse.json({ ok: true, review, message: "شكراً لتقييمك! 🎉" });
  } catch (err) {
    console.error("[reviews POST] error:", err);
    return NextResponse.json({ ok: false, error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ ok: false, error: "courseId مطلوب" }, { status: 400 });
    }

    const reviews = await db.review.findMany({
      where: { courseId, isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        name: true,
        role: true,
        rating: true,
        comment: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return NextResponse.json({
      ok: true,
      reviews,
      avgRating: Math.round(avgRating * 10) / 10,
      count: reviews.length,
    });
  } catch (err) {
    console.error("[reviews GET] error:", err);
    return NextResponse.json({ ok: false, error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
