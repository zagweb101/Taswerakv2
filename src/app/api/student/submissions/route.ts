// ====================================================================
// POST /api/student/submissions
// Upload an assignment submission with image + EXIF data
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { uploadFile, makeObjectKey } from "@/lib/services/minio";
import { writeAudit, notify } from "@/lib/services/audit";

const metadataSchema = z.object({
  assignmentId: z.string().min(1),
  caption: z.string().max(1000).optional().default(""),
  exifData: z.record(z.string(), z.any()).optional().default({}),
});

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "غير مسجّل" }, { status: 401 });
    }
    if (session.user.role !== "STUDENT") {
      return NextResponse.json({ ok: false, error: "هذه العملية للطلاب فقط" }, { status: 403 });
    }

    const form = await req.formData();
    const file = form.get("image") as File | null;
    const metadataRaw = form.get("metadata");

    if (!file) {
      return NextResponse.json({ ok: false, error: "الصورة مطلوبة" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { ok: false, error: "الصيغة غير مدعومة. استخدم JPG أو PNG أو WebP" },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { ok: false, error: "حجم الصورة يجب أن لا يتجاوز 10 ميجابايت" },
        { status: 400 }
      );
    }
    if (!metadataRaw) {
      return NextResponse.json({ ok: false, error: "البيانات ناقصة" }, { status: 400 });
    }

    const parsed = metadataSchema.safeParse(JSON.parse(metadataRaw as string));
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message || "بيانات غير صحيحة" },
        { status: 400 }
      );
    }
    const { assignmentId, caption, exifData } = parsed.data;

    // Verify assignment exists + student is enrolled
    const assignment = await db.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: {
          select: {
            id: true,
            titleAr: true,
            title: true,
            instructorId: true,
          },
        },
        lesson: { select: { id: true } },
      },
    });

    if (!assignment) {
      return NextResponse.json({ ok: false, error: "الواجب غير موجود" }, { status: 404 });
    }

    const enrollment = await db.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: assignment.courseId,
        },
      },
    });

    if (!enrollment || enrollment.status !== "ACTIVE") {
      return NextResponse.json(
        { ok: false, error: "غير مسجّل في هذه الدورة" },
        { status: 403 }
      );
    }

    // Count existing submissions for attempt number
    const existingCount = await db.submission.count({
      where: { assignmentId, studentId: session.user.id },
    });

    // Upload image
    const buffer = Buffer.from(await file.arrayBuffer());
    const objectKey = makeObjectKey("submissions", file.name || "submission.jpg");
    const { url: imageUrl, provider } = await uploadFile(buffer, objectKey, file.type);

    // Create submission
    const submission = await db.submission.create({
      data: {
        assignmentId,
        studentId: session.user.id,
        enrollmentId: enrollment.id,
        lessonId: assignment.lessonId,
        imageUrl,
        originalFileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        exifData: exifData || null,
        caption: caption || null,
        status: "SUBMITTED",
        attemptNumber: existingCount + 1,
      },
    });

    // Audit
    await writeAudit({
      userId: session.user.id,
      action: "SUBMISSION_UPLOAD",
      entity: "Submission",
      entityId: submission.id,
      metadata: {
        assignmentId,
        courseName: assignment.course.titleAr || assignment.course.title,
        attemptNumber: submission.attemptNumber,
        storageProvider: provider,
        hasExif: !!exifData && Object.keys(exifData).length > 0,
      },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    // Notify instructor
    await notify({
      userId: assignment.course.instructorId,
      title: "تسليم واجب جديد 📷",
      body: `سلّم الطالب ${session.user.name || ""} واجباً في دورة "${assignment.course.titleAr || assignment.course.title}".`,
      type: "COURSE_UPDATE",
      link: `/instructor/critiques/${submission.id}`,
    });

    return NextResponse.json({
      ok: true,
      submissionId: submission.id,
      message: "تم تسليم الواجب بنجاح! سيتم إشعار المدرّب.",
    });
  } catch (err) {
    console.error("[submissions/upload] error:", err);
    return NextResponse.json(
      { ok: false, error: "حدث خطأ غير متوقع" },
      { status: 500 }
    );
  }
}
