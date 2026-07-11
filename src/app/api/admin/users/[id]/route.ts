// ====================================================================
// PATCH /api/admin/users/:id
// Body: { isBanned: boolean }
// Admin bans/unbans a user. Banned users cannot log in (checked in authorize()).
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { writeAudit } from "@/lib/services/audit";

const bodySchema = z.object({
  isBanned: z.boolean(),
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
    if (session.user.role !== "ADMIN") {
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
    const { isBanned } = parsed.data;

    // Prevent self-ban + ban of other admins
    if (id === session.user.id) {
      return NextResponse.json(
        { ok: false, error: "لا يمكنك حظر نفسك" },
        { status: 400 }
      );
    }

    const target = await db.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, isBanned: true },
    });

    if (!target) {
      return NextResponse.json({ ok: false, error: "المستخدم غير موجود" }, { status: 404 });
    }

    if (target.role === "ADMIN") {
      return NextResponse.json(
        { ok: false, error: "لا يمكن حظر مدير" },
        { status: 400 }
      );
    }

    if (target.isBanned === isBanned) {
      return NextResponse.json({
        ok: true,
        message: isBanned ? "المستخدم موقوف بالفعل" : "المستخدم غير موقوف بالفعل",
        isBanned,
      });
    }

    const updated = await db.user.update({
      where: { id },
      data: { isBanned },
      select: { id: true, name: true, isBanned: true },
    });

    await writeAudit({
      userId: session.user.id,
      action: isBanned ? "USER_BAN" : "USER_UNBAN",
      entity: "User",
      entityId: target.id,
      metadata: {
        targetName: target.name,
        targetEmail: target.email,
        targetRole: target.role,
      },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({
      ok: true,
      message: isBanned
        ? `تم إيقاف ${target.name || "المستخدم"}`
        : `تم رفع الإيقاف عن ${target.name || "المستخدم"}`,
      isBanned: updated.isBanned,
    });
  } catch (err) {
    console.error("[ban-user] error:", err);
    return NextResponse.json({ ok: false, error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
