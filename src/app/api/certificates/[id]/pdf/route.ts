// ====================================================================
// GET /api/certificates/:id/pdf
// Generate + download certificate as PDF
// Falls back to HTML view if Puppeteer not installed
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { generateCertificatePdf, generateCertificateHtml } from "@/lib/services/pdf/certificate";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "غير مسجّل" }, { status: 401 });
    }

    const { id } = await params;

    const cert = await db.certificate.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, name: true } },
        course: {
          select: {
            id: true,
            titleAr: true,
            title: true,
            instructor: { select: { name: true } },
          },
        },
      },
    });

    if (!cert) {
      return NextResponse.json({ ok: false, error: "الشهادة غير موجودة" }, { status: 404 });
    }

    // Authorization: student can only view own, admin/instructor can view all
    if (
      session.user.role === "STUDENT" &&
      cert.studentId !== session.user.id
    ) {
      return NextResponse.json({ ok: false, error: "غير مصرّح" }, { status: 403 });
    }

    const verifyUrl = `${process.env.NEXTAUTH_URL || ""}/verify/${cert.verifyToken}`;

    const data = {
      studentName: cert.student?.name || "طالب",
      courseName: cert.course?.titleAr || cert.course?.title || "دورة",
      certificateNumber: cert.certificateNumber,
      issuedAt: cert.issuedAt,
      grade: cert.grade,
      verifyToken: cert.verifyToken,
      verifyUrl,
      instructorName: cert.course?.instructor?.name,
    };

    // Try PDF generation
    const pdf = await generateCertificatePdf(data);
    if (pdf) {
      return new NextResponse(pdf as any, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="certificate-${cert.certificateNumber}.pdf"`,
        },
      });
    }

    // Fallback: return HTML for browser print
    const html = await generateCertificateHtml(data);
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (err) {
    console.error("[certificate PDF] error:", err);
    return NextResponse.json({ ok: false, error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
