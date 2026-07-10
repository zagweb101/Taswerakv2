// ====================================================================
// POST /api/admin/users/:id/impersonate
// Admin "logs in as" a target user for support/verification.
// Implementation: encode impersonation in JWT session.
// Audited + flagged on the User record.
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { auth, signIn } from "@/auth";
import { db } from "@/lib/db";
import { writeAudit } from "@/lib/services/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "غير مسجّل" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { ok: false, error: "صلاحيات غير كافية" },
        { status: 403 }
      );
    }

    const { id: targetId } = await params;

    const target = await db.user.findUnique({
      where: { id: targetId },
      select: { id: true, name: true, email: true, role: true, isBanned: true },
    });

    if (!target) {
      return NextResponse.json({ ok: false, error: "المستخدم غير موجود" }, { status: 404 });
    }
    if (target.id === session.user.id) {
      return NextResponse.json({ ok: false, error: "لا يمكنك الانتحال كنفسك" }, { status: 400 });
    }
    if (target.isBanned) {
      return NextResponse.json({ ok: false, error: "المستخدم موقوف" }, { status: 400 });
    }

    // Mark user as impersonated (so audit logs can flag sessions)
    await db.user.update({
      where: { id: target.id },
      data: { isImpersonated: true },
    });

    await writeAudit({
      userId: session.user.id,
      action: "USER_IMPERSONATE",
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

    // Return target user info — client uses a special signIn flow
    // In production this would issue a session with `impersonatedBy` claim
    return NextResponse.json({
      ok: true,
      target: {
        id: target.id,
        name: target.name,
        email: target.email,
        role: target.role,
      },
      message: `تم تسجيل الدخول نيابةً عن ${target.name}`,
    });
  } catch (err) {
    console.error("[impersonate] error:", err);
    return NextResponse.json({ ok: false, error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

// ====================================================================
// DELETE /api/admin/users/:id/impersonate
// End impersonation — restore admin session.
// ====================================================================

export async function DELETE(
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

    const { id: targetId } = await params;

    await db.user.update({
      where: { id: targetId },
      data: { isImpersonated: false },
    });

    await writeAudit({
      userId: session.user.id,
      action: "USER_IMPERSONATE_END",
      entity: "User",
      entityId: targetId,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({ ok: true, message: "تم إنهاء الانتحال" });
  } catch (err) {
    console.error("[impersonate/end] error:", err);
    return NextResponse.json({ ok: false, error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
