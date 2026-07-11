// ====================================================================
// PATCH /api/instructor/submissions/:id
// Save critique (text + pin comments) + update status
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { writeAudit, notify } from "@/lib/services/audit";

const bodySchema = z.object({
  critique: z.string().max(5000).optional(),
  pinComments: z.array(
    z.object({
      id: z.string(),
      x: z.number(),
      y: z.number(),
      text: z.string(),
      authorId: z.string(),
      createdAt: z.string(),
    })
  ).optional(),
  status: z.enum(["UNDER_REVIEW", "CRITIQUED", "APPROVED", "RESUBMITTED"]).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "غير مسجّل" }, { status: 401 });
    }
    if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "صلاحيات غير كافية" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message || "بيانات غير صحيحة" },
        { status: 400 }
      );
    }
    const { critique, pinComments, status } = parsed.data;

    // Load submission + verify ownership
    const submission = await db.submission.findUnique({
      where: { id },
      include: {
        assignment: {
          include: {
            course: { select: { id: true, titleAr: true, title: true, instructorId: true } },
          },
        },
        student: { select: { id: true, name: true, email: true } },
      },
    });

    if (!submission) {
      return NextResponse.json({ ok: false, error: "التسليم غير موجود" }, { status: 404 });
    }

    // Authorization: instructor must own the course
    if (
      session.user.role === "INSTRUCTOR" &&
      submission.assignment.course.instructorId !== session.user.id
    ) {
      return NextResponse.json(
        { ok: false, error: "لا تملك صلاحية نقد هذا التسليم" },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (critique !== undefined) {
      updateData.critique = critique;
      updateData.critiqueById = session.user.id;
      updateData.critiqueAt = new Date();
    }
    if (pinComments !== undefined) {
      updateData.pinComments = pinComments;
    }
    if (status) {
      updateData.status = status;
    }

    const updated = await db.submission.update({
      where: { id },
      data: updateData,
    });

    await writeAudit({
      userId: session.user.id,
      action: "SUBMISSION_CRITIQUE",
      entity: "Submission",
      entityId: submission.id,
      metadata: {
        studentName: submission.student.name,
        courseName: submission.assignment.course.titleAr || submission.assignment.course.title,
        newStatus: status,
        pinCount: pinComments?.length || 0,
        hasTextCritique: !!critique,
      },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
    });

    // Notify student
    if (critique || status === "CRITIQUED" || status === "APPROVED") {
      await notify({
        userId: submission.studentId,
        title: "نقد جديد على عملك 📷",
        body: `أضاف ${session.user.name || "المدرّب"} نقداً على عملك في "${submission.assignment.course.titleAr || submission.assignment.course.title}".`,
        type: "CRITIQUE_RECEIVED",
        link: `/student/submit/${submission.assignmentId}`,
      });
    }

    return NextResponse.json({
      ok: true,
      message: "تم حفظ النقد وإشعار الطالب",
      status: updated.status,
    });
  } catch (err) {
    console.error("[critique/save] error:", err);
    return NextResponse.json({ ok: false, error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
