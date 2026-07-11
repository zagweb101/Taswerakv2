// ====================================================================
// POST /api/instructor/courses        → Create new course
// GET  /api/instructor/courses        → List instructor's courses
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { writeAudit } from "@/lib/services/audit";

const createSchema = z.object({
  title: z.string().min(2, "العنوان مطلوب").max(120),
  titleAr: z.string().max(120).optional(),
  description: z.string().min(10, "الوصف مطلوب").max(2000),
  descriptionAr: z.string().max(2000).optional(),
  price: z.number().min(0, "السعر مطلوب"),
  discountPrice: z.number().min(0).optional().nullable(),
  currency: z.string().default("SAR"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "PROFESSIONAL"]).default("BEGINNER"),
  category: z.string().max(60).optional(),
  durationHours: z.number().min(0).default(0),
  capacity: z.number().min(1).optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  thumbnailUrl: z.string().url().optional().nullable(),
  previewVideoUrl: z.string().url().optional().nullable(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "غير مسجّل" }, { status: 401 });
    }
    if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "صلاحيات غير كافية" }, { status: 403 });
    }

    const courses = await db.course.findMany({
      where: { instructorId: session.user.id },
      include: {
        _count: { select: { enrollments: true, sections: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      ok: true,
      courses: courses.map((c) => ({
        ...c,
        price: Number(c.price),
        discountPrice: c.discountPrice ? Number(c.discountPrice) : null,
      })),
    });
  } catch (err) {
    console.error("[instructor/courses GET] error:", err);
    return NextResponse.json({ ok: false, error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "غير مسجّل" }, { status: 401 });
    }
    if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "صلاحيات غير كافية" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message || "بيانات غير صحيحة" },
        { status: 400 }
      );
    }
    const data = parsed.data;

    // Generate slug from title
    const slugBase = (data.titleAr || data.title)
      .toLowerCase()
      .replace(/[^\u0600-\u06FFa-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `course-${Date.now()}`;
    let slug = slugBase;
    let suffix = 1;
    while (await db.course.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${suffix++}`;
    }

    const course = await db.course.create({
      data: {
        ...data,
        slug,
        instructorId: session.user.id,
        status: "DRAFT",
        language: "ar",
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        capacity: data.capacity || null,
        thumbnailUrl: data.thumbnailUrl || null,
        previewVideoUrl: data.previewVideoUrl || null,
        discountPrice: data.discountPrice || null,
      },
    });

    await writeAudit({
      userId: session.user.id,
      action: "COURSE_CREATE",
      entity: "Course",
      entityId: course.id,
      metadata: { title: course.title, slug: course.slug },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
    });

    return NextResponse.json({
      ok: true,
      course: {
        ...course,
        price: Number(course.price),
        discountPrice: course.discountPrice ? Number(course.discountPrice) : null,
      },
      message: "تم إنشاء الدورة بنجاح (مسودة)",
    });
  } catch (err) {
    console.error("[instructor/courses POST] error:", err);
    return NextResponse.json({ ok: false, error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
