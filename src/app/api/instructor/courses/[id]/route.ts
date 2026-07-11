// ====================================================================
// GET    /api/instructor/courses/:id   → Fetch course with sections + lessons
// PATCH  /api/instructor/courses/:id   → Update course metadata
// DELETE /api/instructor/courses/:id   → Delete course (only if DRAFT + no enrollments)
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { writeAudit } from "@/lib/services/audit";

const updateSchema = z.object({
  title: z.string().min(2).max(120).optional(),
  titleAr: z.string().max(120).optional().nullable(),
  description: z.string().min(10).max(2000).optional(),
  descriptionAr: z.string().max(2000).optional().nullable(),
  price: z.number().min(0).optional(),
  discountPrice: z.number().min(0).optional().nullable(),
  currency: z.string().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "PROFESSIONAL"]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "UNLISTED", "ARCHIVED"]).optional(),
  category: z.string().max(60).optional().nullable(),
  durationHours: z.number().min(0).optional(),
  capacity: z.number().min(1).optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  thumbnailUrl: z.string().url().optional().nullable(),
  previewVideoUrl: z.string().url().optional().nullable(),
  isFeatured: z.boolean().optional(),
});

export async function GET(
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
    const course = await db.course.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { order: "asc" },
          include: {
            lessons: { orderBy: { order: "asc" } },
          },
        },
        _count: { select: { enrollments: true } },
        instructor: { select: { id: true, name: true } },
      },
    });

    if (!course) {
      return NextResponse.json({ ok: false, error: "الدورة غير موجودة" }, { status: 404 });
    }

    // Authorization
    if (session.user.role === "INSTRUCTOR" && course.instructorId !== session.user.id) {
      return NextResponse.json({ ok: false, error: "غير مصرّح" }, { status: 403 });
    }

    return NextResponse.json({
      ok: true,
      course: {
        ...course,
        price: Number(course.price),
        discountPrice: course.discountPrice ? Number(course.discountPrice) : null,
      },
    });
  } catch (err) {
    console.error("[course GET] error:", err);
    return NextResponse.json({ ok: false, error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

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
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message || "بيانات غير صحيحة" },
        { status: 400 }
      );
    }

    const existing = await db.course.findUnique({ where: { id }, select: { instructorId: true, status: true } });
    if (!existing) {
      return NextResponse.json({ ok: false, error: "الدورة غير موجودة" }, { status: 404 });
    }
    if (session.user.role === "INSTRUCTOR" && existing.instructorId !== session.user.id) {
      return NextResponse.json({ ok: false, error: "غير مصرّح" }, { status: 403 });
    }

    const data: any = { ...parsed.data };
    if (data.startDate !== undefined) data.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.endDate !== undefined) data.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.capacity !== undefined) data.capacity = data.capacity || null;
    if (data.thumbnailUrl !== undefined) data.thumbnailUrl = data.thumbnailUrl || null;
    if (data.previewVideoUrl !== undefined) data.previewVideoUrl = data.previewVideoUrl || null;
    if (data.discountPrice !== undefined) data.discountPrice = data.discountPrice || null;
    if (data.titleAr !== undefined) data.titleAr = data.titleAr || null;
    if (data.descriptionAr !== undefined) data.descriptionAr = data.descriptionAr || null;
    if (data.category !== undefined) data.category = data.category || null;

    const updated = await db.course.update({
      where: { id },
      data,
    });

    await writeAudit({
      userId: session.user.id,
      action: "COURSE_UPDATE",
      entity: "Course",
      entityId: id,
      metadata: { fields: Object.keys(data) },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
    });

    return NextResponse.json({
      ok: true,
      course: {
        ...updated,
        price: Number(updated.price),
        discountPrice: updated.discountPrice ? Number(updated.discountPrice) : null,
      },
    });
  } catch (err) {
    console.error("[course PATCH] error:", err);
    return NextResponse.json({ ok: false, error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

export async function DELETE(
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
    const course = await db.course.findUnique({
      where: { id },
      select: { instructorId: true, status: true, _count: { select: { enrollments: true } } },
    });

    if (!course) {
      return NextResponse.json({ ok: false, error: "الدورة غير موجودة" }, { status: 404 });
    }
    if (session.user.role === "INSTRUCTOR" && course.instructorId !== session.user.id) {
      return NextResponse.json({ ok: false, error: "غير مصرّح" }, { status: 403 });
    }
    // Only allow deletion if DRAFT and no enrollments
    if (course.status !== "DRAFT" || course._count.enrollments > 0) {
      return NextResponse.json(
        { ok: false, error: "لا يمكن حذف دورة منشورة أو بها تسجيلات. أرشفها بدلاً من ذلك." },
        { status: 400 }
      );
    }

    await db.course.delete({ where: { id } });

    await writeAudit({
      userId: session.user.id,
      action: "COURSE_DELETE",
      entity: "Course",
      entityId: id,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
    });

    return NextResponse.json({ ok: true, message: "تم حذف الدورة" });
  } catch (err) {
    console.error("[course DELETE] error:", err);
    return NextResponse.json({ ok: false, error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
