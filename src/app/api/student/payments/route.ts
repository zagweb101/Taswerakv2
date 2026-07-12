// ====================================================================
// POST /api/student/payments
// Upload a manual bank transfer receipt end-to-end:
//   1. Validate auth (must be STUDENT)
//   2. Parse multipart form (image + metadata)
//   3. Validate image type/size
//   4. Store image in MinIO (or local fallback)
//   5. Create Enrollment (PENDING_APPROVAL) if not exists
//   6. Create PaymentReceipt (status: PENDING)
//   7. Write audit log
//   8. Return receipt id
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { uploadFile, makeObjectKey } from "@/lib/services/minio";
import { writeAudit } from "@/lib/services/audit";
import { z } from "zod";

const metadataSchema = z.object({
  courseId: z.string().min(1, "الدورة مطلوبة"),
  bankName: z.string().min(2, "اسم البنك مطلوب"),
  amount: z.string().or(z.number()).transform((v) => Number(v)),
  referenceNumber: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
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
    const file = form.get("receipt") as File | null;
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
        { ok: false, error: "حجم الصورة يجب أن لا يتجاوز 5 ميجابايت" },
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
    const { courseId, bankName, amount, referenceNumber, notes } = parsed.data;

    // Verify course exists + published
    let course;
    try {
      course = await db.course.findUnique({
        where: { id: courseId },
        select: { id: true, titleAr: true, title: true, price: true, currency: true, status: true, instructorId: true },
      });
    } catch {
      return NextResponse.json(
        { ok: false, error: "قاعدة البيانات غير متصلة. حاول لاحقاً." },
        { status: 503 }
      );
    }

    if (!course) {
      return NextResponse.json({ ok: false, error: "الدورة غير موجودة" }, { status: 404 });
    }
    if (course.status !== "PUBLISHED") {
      return NextResponse.json({ ok: false, error: "الدورة غير متاحة للتسجيل" }, { status: 400 });
    }

    // Check existing enrollment (student can't enroll twice)
    const existing = await db.enrollment.findUnique({
      where: { studentId_courseId: { studentId: session.user.id, courseId } },
    });
    if (existing && ["ACTIVE", "PENDING_APPROVAL"].includes(existing.status)) {
      return NextResponse.json(
        { ok: false, error: "أنت مسجّل في هذه الدورة بالفعل" },
        { status: 409 }
      );
    }

    // Upload image
    const buffer = Buffer.from(await file.arrayBuffer());

    // Secure server-side validation against MIME spoofing
    try {
      const sharp = (await import("sharp")).default;
      await sharp(buffer).metadata();
    } catch {
      return NextResponse.json(
        { ok: false, error: "الملف المرفوع ليس صورة صالحة" },
        { status: 400 }
      );
    }

    const objectKey = makeObjectKey("receipts", file.name || "receipt.jpg");
    const { url: imageUrl, provider } = await uploadFile(buffer, objectKey, file.type);

    // Create or update enrollment + payment receipt (atomic)
    const enrollment = existing
      ? await db.enrollment.update({
          where: { id: existing.id },
          data: { status: "PENDING_APPROVAL", enrolledAt: new Date() },
        })
      : await db.enrollment.create({
          data: {
            studentId: session.user.id,
            courseId,
            status: "PENDING_APPROVAL",
          },
        });

    const receipt = await db.paymentReceipt.create({
      data: {
        enrollmentId: enrollment.id,
        studentId: session.user.id,
        imageUrl,
        bankName,
        amount,
        currency: course.currency,
        referenceNumber: referenceNumber || null,
        notes: notes || null,
        status: "PENDING",
      },
    });

    // Audit
    await writeAudit({
      userId: session.user.id,
      action: "PAYMENT_UPLOAD",
      entity: "PaymentReceipt",
      entityId: receipt.id,
      metadata: {
        courseId,
        courseName: course.titleAr || course.title,
        amount,
        currency: course.currency,
        bankName,
        storageProvider: provider,
      },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({
      ok: true,
      receiptId: receipt.id,
      enrollmentId: enrollment.id,
      message: "تم رفع الإيصال بنجاح. سيتم مراجعته من المدرّب خلال 24 ساعة.",
    });
  } catch (err) {
    console.error("[payments/upload] error:", err);
    return NextResponse.json(
      { ok: false, error: "حدث خطأ غير متوقع. حاول مرة أخرى." },
      { status: 500 }
    );
  }
}
