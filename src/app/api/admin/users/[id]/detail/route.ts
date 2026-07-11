// ====================================================================
// GET /api/admin/users/:id/detail
// Returns full user detail: enrollments + payments + certificates
// Admin-only. Used by UserDetailDialog.
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(
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

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isBanned: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "المستخدم غير موجود" }, { status: 404 });
    }

    // Fetch related data in parallel
    const [enrollments, payments, certificates] = await Promise.all([
      db.enrollment.findMany({
        where: { studentId: id },
        include: {
          course: { select: { titleAr: true, title: true } },
        },
        orderBy: { enrolledAt: "desc" },
        take: 20,
      }),
      db.paymentReceipt.findMany({
        where: { studentId: id },
        include: {
          enrollment: {
            select: { course: { select: { titleAr: true, title: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      db.certificate.findMany({
        where: { studentId: id },
        include: {
          course: { select: { titleAr: true, title: true } },
        },
        orderBy: { issuedAt: "desc" },
        take: 20,
      }),
    ]);

    return NextResponse.json({
      ok: true,
      user,
      enrollments: enrollments.map((e) => ({
        id: e.id,
        status: e.status,
        progress: e.progress,
        enrolledAt: e.enrolledAt.toISOString(),
        course: e.course,
      })),
      payments: payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        bankName: p.bankName,
        referenceNumber: p.referenceNumber,
        createdAt: p.createdAt.toISOString(),
        enrollment: p.enrollment,
      })),
      certificates: certificates.map((c) => ({
        id: c.id,
        certificateNumber: c.certificateNumber,
        issuedAt: c.issuedAt.toISOString(),
        grade: c.grade,
        course: c.course,
      })),
    });
  } catch (err) {
    console.error("[user-detail] error:", err);
    return NextResponse.json({ ok: false, error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
