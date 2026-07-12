// ====================================================================
// POST /api/admin/users/:id/impersonate
// Admin "logs in as" target user. Issues a NEW JWT session.
//
// Flow:
//   1. Validate admin session + permissions
//   2. Validate target exists, not banned, not admin
//   3. Mark target.isImpersonated = true (for audit visibility)
//   4. Call signIn("impersonation", { targetUserId, adminUserId })
//      → Auth.js issues new JWT with role=target.role + impersonatedBy=adminId
//   5. Audit log
//   6. Return success → client redirects to target dashboard
//
// DELETE /api/admin/users/:id/impersonate
// End impersonation — admin must sign in again (full re-auth).
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { auth, signIn, createImpersonationToken } from "@/auth";
import { db } from "@/lib/db";
import { writeAudit } from "@/lib/services/audit";
import { rateLimitPresets } from "@/lib/services/rate-limit";

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
      return NextResponse.json({ ok: false, error: "صلاحيات غير كافية" }, { status: 403 });
    }

    // Rate limit: 10 impersonations per admin per hour
    const rl = rateLimitPresets.impersonate(session.user.id);
    if (!rl.success) {
      return NextResponse.json(
        { ok: false, error: "محاولات انتحال كثيرة. حاول بعد ساعة." },
        { status: 429 }
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
      return NextResponse.json({ ok: false, error: "لا يمكنك انتحال نفسك" }, { status: 400 });
    }
    if (target.isBanned) {
      return NextResponse.json({ ok: false, error: "المستخدم موقوف" }, { status: 400 });
    }
    if (target.role === "ADMIN") {
      return NextResponse.json({ ok: false, error: "لا يمكن انتحال مدير آخر" }, { status: 400 });
    }

    // Mark user as impersonated (for audit visibility in users table)
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

    // Generate a cryptographically signed impersonation token
    const token = createImpersonationToken(target.id, session.user.id);

    // Issue new session via impersonation provider with signed token
    await signIn("impersonation", {
      token,
      redirect: false,
    });

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
  } catch (err: any) {
    console.error("[impersonate] error:", err);
    // signIn may throw a redirect — that's expected, treat as success
    if (err?.message?.includes("REDIRECT") || err?.digest?.includes("REDIRECT")) {
      return NextResponse.json({ ok: true, message: "تم بدء الانتحال" });
    }
    return NextResponse.json(
      { ok: false, error: err?.message || "حدث خطأ غير متوقع" },
      { status: 500 }
    );
  }
}

// ====================================================================
// DELETE /api/admin/users/:id/impersonate
// End impersonation — admin must sign in again with own credentials.
// We clear the impersonation flag + sign out the current (impersonated) session.
// The admin re-authenticates to get their own session back.
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
    // Only the impersonating admin (or an admin) can end impersonation
    const impersonatedBy = (session.user as any).impersonatedBy;
    if (!impersonatedBy && session.user.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "صلاحيات غير كافية" }, { status: 403 });
    }

    const { id: targetId } = await params;

    // Clear flag
    await db.user.update({
      where: { id: targetId },
      data: { isImpersonated: false },
    });

    await writeAudit({
      userId: impersonatedBy || session.user.id,
      action: "USER_IMPERSONATE_END",
      entity: "User",
      entityId: targetId,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    // The client must sign out + redirect to /login to re-authenticate as admin
    return NextResponse.json({
      ok: true,
      message: "تم إنهاء الانتحال — سجّل الدخول من جديد كمدير",
      mustReauth: true,
    });
  } catch (err: any) {
    console.error("[impersonate/end] error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "حدث خطأ غير متوقع" },
      { status: 500 }
    );
  }
}
