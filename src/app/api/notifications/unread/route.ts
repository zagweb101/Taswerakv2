// ====================================================================
// GET /api/notifications/unread
// Returns unread notifications for the current user (any role)
// ====================================================================

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "غير مسجّل" }, { status: 401 });
    }

    const notifications = await db.notification.findMany({
      where: {
        userId: session.user.id,
        readAt: null,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        body: true,
        type: true,
        link: true,
        readAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, notifications });
  } catch (err) {
    console.error("[notifications/unread] error:", err);
    return NextResponse.json({ ok: false, error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
