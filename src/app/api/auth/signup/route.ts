// ====================================================================
// Signup endpoint — creates a STUDENT account (default role)
// For instructor/admin creation, admin must use admin dashboard later.
// ====================================================================

import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string().min(2, "الاسم قصير جداً"),
  email: z.string().email("بريد غير صحيح"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  phone: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return NextResponse.json(
        { ok: false, error: first?.message ?? "بيانات غير صحيحة" },
        { status: 400 }
      );
    }

    const { name, email, password, phone } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const exists = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });
    if (exists) {
      return NextResponse.json(
        { ok: false, error: "هذا البريد مسجّل مسبقاً" },
        { status: 409 }
      );
    }

    const hash = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hash,
        phone: phone || null,
        role: "STUDENT",
      },
      select: { id: true, email: true, role: true },
    });

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error("[signup] error:", err);
    return NextResponse.json(
      { ok: false, error: "حدث خطأ، حاول مرة أخرى" },
      { status: 500 }
    );
  }
}
