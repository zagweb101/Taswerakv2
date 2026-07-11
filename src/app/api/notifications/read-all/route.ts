// ====================================================================
// PATCH /api/notifications/read-all
// Mark all unread notifications as read for the current user
// ====================================================================

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function PATCH() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "غير مسجّل" }, { status: 401 });
    }

    const result = await db.notification.updateMany({
      where: {
        userId: session.user.id,
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return NextResponse.json({
      ok: true,
      updated: result.count,
      message: `تم تعليم ${result.count} إشعار كمقروء`,
    });
  } catch (err) {
    console.error("[notifications/read-all] error:", err);
    return NextResponse.json({ ok: false, error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
