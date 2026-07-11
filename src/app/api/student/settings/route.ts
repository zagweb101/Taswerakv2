// ====================================================================
// Student Settings API
// GET    /api/student/settings  → fetch current settings
// PUT    /api/student/settings  → update settings (partial)
//
// Settings stored in UserSettings.data JSONB column.
// Falls back to in-memory store if DB unavailable (dev sandbox).
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { writeAudit } from "@/lib/services/audit";
import { rateLimitPresets, getClientIP } from "@/lib/services/rate-limit";

const memoryStore = new Map<string, any>();

const notificationsSchema = z.object({
  emailPayments: z.boolean().default(true),
  emailCritiques: z.boolean().default(true),
  emailCourses: z.boolean().default(false),
  smsNotifications: z.boolean().default(false),
});

const privacySchema = z.object({
  publicProfile: z.boolean().default(true),
});

const profileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")).or(z.null()),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

const updateSchema = z.object({
  section: z.enum(["profile", "notifications", "privacy", "password"]),
  profile: profileSchema.optional(),
  notifications: notificationsSchema.optional(),
  privacy: privacySchema.optional(),
  password: passwordSchema.optional(),
});

async function getSettings(userId: string): Promise<any> {
  try {
    const row = await db.userSettings.findUnique({ where: { userId } });
    return row?.data || {};
  } catch {
    return memoryStore.get(userId) || {};
  }
}

async function saveSettings(userId: string, data: any): Promise<void> {
  try {
    await db.userSettings.upsert({
      where: { userId },
      create: { userId, data },
      update: { data },
    });
  } catch {
    memoryStore.set(userId, data);
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "غير مسجّل" }, { status: 401 });
    }
    if (session.user.role !== "STUDENT") {
      return NextResponse.json({ ok: false, error: "هذه الإعدادات للطلاب فقط" }, { status: 403 });
    }

    const settings = await getSettings(session.user.id);

    const defaults = {
      profile: {
        name: session.user.name || "",
        email: session.user.email || "",
        phone: "",
        bio: "",
        avatarUrl: null,
      },
      notifications: {
        emailPayments: true,
        emailCritiques: true,
        emailCourses: false,
        smsNotifications: false,
      },
      privacy: { publicProfile: true },
    };

    return NextResponse.json({
      ok: true,
      settings: {
        ...defaults,
        ...settings,
        profile: { ...defaults.profile, ...(settings.profile || {}) },
        notifications: { ...defaults.notifications, ...(settings.notifications || {}) },
        privacy: { ...defaults.privacy, ...(settings.privacy || {}) },
      },
    });
  } catch (err) {
    console.error("[student/settings GET] error:", err);
    return NextResponse.json({ ok: false, error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "غير مسجّل" }, { status: 401 });
    }
    if (session.user.role !== "STUDENT") {
      return NextResponse.json({ ok: false, error: "هذه الإعدادات للطلاب فقط" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message || "بيانات غير صحيحة" },
        { status: 400 }
      );
    }

    const { section, profile, notifications, privacy, password } = parsed.data;
    const currentSettings = await getSettings(session.user.id);
    const newSettings = { ...currentSettings };

    if (section === "profile" && profile) {
      try {
        await db.user.update({
          where: { id: session.user.id },
          data: {
            ...(profile.name !== undefined && { name: profile.name }),
            ...(profile.email !== undefined && { email: profile.email.toLowerCase() }),
            ...(profile.phone !== undefined && { phone: profile.phone }),
            ...(profile.bio !== undefined && { bio: profile.bio }),
          },
        });
      } catch {
        newSettings.profile = { ...(currentSettings.profile || {}), ...profile };
      }
      await writeAudit({
        userId: session.user.id,
        action: "PROFILE_UPDATE",
        entity: "User",
        entityId: session.user.id,
        metadata: { section: "profile" },
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
      });
    } else if (section === "notifications" && notifications) {
      newSettings.notifications = notifications;
    } else if (section === "privacy" && privacy) {
      newSettings.privacy = privacy;
    } else if (section === "password" && password) {
      // Rate limit password changes: 5 per hour per IP
      const ip = getClientIP(req);
      const rl = rateLimitPresets.passwordChange(ip);
      if (!rl.success) {
        return NextResponse.json(
          { ok: false, error: "محاولات كثيرة. حاول بعد ساعة." },
          { status: 429 }
        );
      }
      try {
        const user = await db.user.findUnique({
          where: { id: session.user.id },
          select: { password: true },
        });
        if (!user?.password) {
          return NextResponse.json({ ok: false, error: "الحساب غير صحيح" }, { status: 400 });
        }
        const valid = await bcrypt.compare(password.currentPassword, user.password);
        if (!valid) {
          return NextResponse.json({ ok: false, error: "كلمة المرور الحالية غير صحيحة" }, { status: 400 });
        }
        const hash = await bcrypt.hash(password.newPassword, 12);
        await db.user.update({
          where: { id: session.user.id },
          data: { password: hash },
        });
        await writeAudit({
          userId: session.user.id,
          action: "PASSWORD_CHANGE",
          entity: "User",
          entityId: session.user.id,
          ipAddress: req.headers.get("x-forwarded-for") || undefined,
        });
      } catch {
        return NextResponse.json({ ok: false, error: "قاعدة البيانات غير متصلة" }, { status: 503 });
      }
    }

    await saveSettings(session.user.id, newSettings);

    return NextResponse.json({
      ok: true,
      message: "تم حفظ الإعدادات بنجاح",
      settings: newSettings,
    });
  } catch (err) {
    console.error("[student/settings PUT] error:", err);
    return NextResponse.json({ ok: false, error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
