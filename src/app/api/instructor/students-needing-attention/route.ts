// ====================================================================
// GET /api/instructor/students-needing-attention
// Returns students who haven't been active in 7+ days OR have pending
// submissions OR are stuck at low progress
// ====================================================================

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "غير مسجّل" }, { status: 401 });
    }
    if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "صلاحيات غير كافية" }, { status: 403 });
    }

    const where: any = { course: {} };
    if (session.user.role === "INSTRUCTOR") {
      where.course.instructorId = session.user.id;
    }

    // Students with PENDING_APPROVAL payments (stuck)
    const stuckPayments = await db.enrollment.findMany({
      where: { ...where, status: "PENDING_APPROVAL" },
      include: {
        student: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, titleAr: true, title: true } },
      },
      orderBy: { enrolledAt: "asc" },
      take: 10,
    });

    // Students with low progress (< 25%) after 7+ days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const lowProgress = await db.enrollment.findMany({
      where: {
        ...where,
        status: "ACTIVE",
        progress: { lt: 25 },
        enrolledAt: { lt: sevenDaysAgo },
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, titleAr: true, title: true } },
      },
      orderBy: { enrolledAt: "asc" },
      take: 10,
    });

    // Students with SUBMITTED submissions (need critique)
    const whereSub: any = {
      status: "SUBMITTED",
    };
    if (session.user.role === "INSTRUCTOR") {
      whereSub.assignment = { course: { instructorId: session.user.id } };
    }
    const pendingSubmissions = await db.submission.findMany({
      where: whereSub,
      include: {
        student: { select: { id: true, name: true } },
        assignment: {
          include: {
            course: { select: { id: true, titleAr: true, title: true } },
          },
        },
      },
      orderBy: { submittedAt: "asc" },
      take: 10,
    });

    return NextResponse.json({
      ok: true,
      stuckPayments: stuckPayments.map((e) => ({
        type: "STUCK_PAYMENT",
        studentId: e.student.id,
        studentName: e.student.name,
        courseName: e.course.titleAr || e.course.title,
        detail: `بانتظار اعتماد دفعة منذ ${Math.floor((Date.now() - e.enrolledAt.getTime()) / (1000 * 60 * 60 * 24))} يوم`,
        link: "/instructor/payments",
        daysSince: Math.floor((Date.now() - e.enrolledAt.getTime()) / (1000 * 60 * 60 * 24)),
      })),
      lowProgress: lowProgress.map((e) => ({
        type: "LOW_PROGRESS",
        studentId: e.student.id,
        studentName: e.student.name,
        courseName: e.course.titleAr || e.course.title,
        detail: `تقدّم ${Math.round(e.progress)}% منذ ${Math.floor((Date.now() - e.enrolledAt.getTime()) / (1000 * 60 * 60 * 24))} يوم`,
        link: `/instructor/students/${e.student.id}`,
        daysSince: Math.floor((Date.now() - e.enrolledAt.getTime()) / (1000 * 60 * 60 * 24)),
      })),
      pendingSubmissions: pendingSubmissions.map((s) => ({
        type: "PENDING_CRITIQUE",
        studentId: s.student.id,
        studentName: s.student.name,
        courseName: s.assignment.course.titleAr || s.assignment.course.title,
        detail: `تسليم بانتظار النقد`,
        link: `/instructor/critiques/${s.id}`,
        daysSince: Math.floor((Date.now() - s.submittedAt.getTime()) / (1000 * 60 * 60 * 24)),
      })),
    });
  } catch (err) {
    console.error("[students-needing-attention] error:", err);
    return NextResponse.json({ ok: false, error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
