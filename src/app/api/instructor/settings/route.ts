// ====================================================================
// Instructor Settings API
// GET /api/instructor/settings → fetch
// PUT /api/instructor/settings → update
// Sections: profile, payout, schedule, courseDefaults, publicProfile
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { writeAudit } from "@/lib/services/audit";

const memoryStore = new Map<string, any>();

const profileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  title: z.string().max(120).optional(),
  bio: z.string().max(1000).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
});

const payoutSchema = z.object({
  bankName: z.string().min(2).max(80),
  accountName: z.string().min(2).max(120),
  iban: z.string().min(10).max(34),
  payoutFrequency: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "ON_DEMAND"]),
  minPayout: z.string().or(z.number()),
});

const scheduleSchema = z.object({
  sunday: z.boolean().default(true),
  monday: z.boolean().default(true),
  tuesday: z.boolean().default(true),
  wednesday: z.boolean().default(true),
  thursday: z.boolean().default(true),
  friday: z.boolean().default(false),
  saturday: z.boolean().default(false),
  startTime: z.string(),
  endTime: z.string(),
  timezone: z.string(),
});

const courseDefaultsSchema = z.object({
  defaultCurrency: z.enum(["SAR", "USD", "AED"]),
  defaultLanguage: z.enum(["ar", "en", "ar_en"]),
  autoApproveEnrollment: z.boolean(),
  requireExif: z.boolean(),
  allowResubmission: z.boolean(),
});

const updateSchema = z.object({
  section: z.enum(["profile", "payout", "schedule", "courseDefaults", "publicProfile"]),
  profile: profileSchema.optional(),
  payout: payoutSchema.optional(),
  schedule: scheduleSchema.optional(),
  courseDefaults: courseDefaultsSchema.optional(),
  publicProfile: z.boolean().optional(),
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
    if (session.user.role !== "INSTRUCTOR") {
      return NextResponse.json({ ok: false, error: "هذه الإعدادات للمدرّبين فقط" }, { status: 403 });
    }

    const settings = await getSettings(session.user.id);

    const defaults = {
      profile: {
        name: session.user.name || "",
        title: "مصور محترف ومدرّب تصوير",
        bio: "",
        phone: "",
        email: session.user.email || "",
      },
      payout: {
        bankName: "البنك الأهلي السعودي",
        accountName: session.user.name || "",
        iban: "",
        payoutFrequency: "MONTHLY",
        minPayout: "500",
      },
      schedule: {
        sunday: true, monday: true, tuesday: true, wednesday: true, thursday: true,
        friday: false, saturday: false,
        startTime: "10:00",
        endTime: "20:00",
        timezone: "Asia/Riyadh",
      },
      courseDefaults: {
        defaultCurrency: "SAR",
        defaultLanguage: "ar",
        autoApproveEnrollment: false,
        requireExif: true,
        allowResubmission: true,
      },
      publicProfile: true,
    };

    return NextResponse.json({
      ok: true,
      settings: {
        ...defaults,
        ...settings,
        profile: { ...defaults.profile, ...(settings.profile || {}) },
        payout: { ...defaults.payout, ...(settings.payout || {}) },
        schedule: { ...defaults.schedule, ...(settings.schedule || {}) },
        courseDefaults: { ...defaults.courseDefaults, ...(settings.courseDefaults || {}) },
      },
    });
  } catch (err) {
    console.error("[instructor/settings GET] error:", err);
    return NextResponse.json({ ok: false, error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "غير مسجّل" }, { status: 401 });
    }
    if (session.user.role !== "INSTRUCTOR") {
      return NextResponse.json({ ok: false, error: "هذه الإعدادات للمدرّبين فقط" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message || "بيانات غير صحيحة" },
        { status: 400 }
      );
    }

    const { section, profile, payout, schedule, courseDefaults, publicProfile } = parsed.data;
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
      if (profile.title !== undefined) {
        newSettings.profile = { ...(newSettings.profile || {}), title: profile.title };
      }
    } else if (section === "payout" && payout) {
      newSettings.payout = payout;
    } else if (section === "schedule" && schedule) {
      newSettings.schedule = schedule;
    } else if (section === "courseDefaults" && courseDefaults) {
      newSettings.courseDefaults = courseDefaults;
    } else if (section === "publicProfile" && publicProfile !== undefined) {
      newSettings.publicProfile = publicProfile;
    }

    await saveSettings(session.user.id, newSettings);

    await writeAudit({
      userId: session.user.id,
      action: "SETTINGS_UPDATE",
      entity: "UserSettings",
      entityId: session.user.id,
      metadata: { section, role: "INSTRUCTOR" },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
    });

    return NextResponse.json({
      ok: true,
      message: "تم حفظ الإعدادات بنجاح",
      settings: newSettings,
    });
  } catch (err) {
    console.error("[instructor/settings PUT] error:", err);
    return NextResponse.json({ ok: false, error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
