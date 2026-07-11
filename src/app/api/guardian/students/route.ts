// ====================================================================
// GET /api/guardian/students
// Returns students linked to the current guardian
// ====================================================================

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ ok: false, error: "غير مسجّل" }, { status: 401 });
    if (session.user.role !== "GUARDIAN") return NextResponse.json({ ok: false, error: "لأولياء الأمور فقط" }, { status: 403 });

    const links = await db.guardianLink.findMany({
      where: { guardianId: session.user.id },
      include: {
        student: {
          select: {
            id: true, name: true, email: true, image: true,
            enrollments: {
              include: {
                course: { select: { id: true, titleAr: true, title: true } },
              },
              orderBy: { enrolledAt: "desc" },
            },
            certificates: {
              include: { course: { select: { titleAr: true, title: true } } },
              orderBy: { issuedAt: "desc" },
            },
          },
        },
      },
    });

    return NextResponse.json({ ok: true, students: links.map((l) => l.student) });
  } catch (err) {
    console.error("[guardian/students] error:", err);
    return NextResponse.json({ ok: false, error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
