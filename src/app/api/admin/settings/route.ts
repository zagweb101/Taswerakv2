// ====================================================================
// Admin Settings API
// GET /api/admin/settings → fetch global settings (from CmsContent)
// PUT /api/admin/settings → update global settings
// Sections: smtp, minio, bank, cms, flags, auditPolicy
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { writeAudit } from "@/lib/services/audit";

const memoryStore = new Map<string, string>();

const smtpSchema = z.object({
  host: z.string().max(120),
  port: z.string().or(z.number()),
  user: z.string().max(120),
  password: z.string().max(200),
  from: z.string().email(),
  transport: z.enum(["simulation", "smtp"]),
});

const minioSchema = z.object({
  endpoint: z.string().max(200),
  bucket: z.string().max(80),
  accessKey: z.string().max(120),
  secretKey: z.string().max(200),
  publicUrl: z.string().max(200),
});

const bankSchema = z.object({
  name: z.string().min(2).max(120),
  accountName: z.string().min(2).max(120),
  iban: z.string().min(10).max(34),
  accountNumber: z.string().max(20),
});

const cmsSchema = z.object({
  heroTitle: z.string().max(200),
  heroSubtitle: z.string().max(300),
  footerNote: z.string().max(500),
});

const flagsSchema = z.object({
  enableSignup: z.boolean(),
  enableImpersonation: z.boolean(),
  enableCertificates: z.boolean(),
  enablePublicCourses: z.boolean(),
  maintenanceMode: z.boolean(),
  requireEmailVerification: z.boolean(),
});

const auditPolicySchema = z.object({
  logAuth: z.boolean(),
  logPayments: z.boolean(),
  logContentChanges: z.boolean(),
  retentionDays: z.string().or(z.number()),
});

const updateSchema = z.object({
  section: z.enum(["smtp", "minio", "bank", "cms", "flags", "auditPolicy"]),
  smtp: smtpSchema.optional(),
  minio: minioSchema.optional(),
  bank: bankSchema.optional(),
  cms: cmsSchema.optional(),
  flags: flagsSchema.optional(),
  auditPolicy: auditPolicySchema.optional(),
});

const CMS_KEY_PREFIX = "admin_settings_";

async function getCmsValue(key: string): Promise<string | null> {
  try {
    const row = await db.cmsContent.findUnique({ where: { key: `${CMS_KEY_PREFIX}${key}` } });
    return row?.value || null;
  } catch {
    return memoryStore.get(`${CMS_KEY_PREFIX}${key}`) || null;
  }
}

async function setCmsValue(key: string, value: string): Promise<void> {
  try {
    await db.cmsContent.upsert({
      where: { key: `${CMS_KEY_PREFIX}${key}` },
      create: { key: `${CMS_KEY_PREFIX}${key}`, value, type: "json" },
      update: { value, type: "json" },
    });
  } catch {
    memoryStore.set(`${CMS_KEY_PREFIX}${key}`, value);
  }
}

const defaults = {
  smtp: {
    host: "",
    port: "587",
    user: "",
    password: "",
    from: "no-reply@taswerak.com",
    transport: "simulation",
  },
  minio: {
    endpoint: "http://localhost:9000",
    bucket: "taswerak-uploads",
    accessKey: "taswerak_minio",
    secretKey: "",
    publicUrl: "http://localhost:9000",
  },
  bank: {
    name: "البنك الأهلي السعودي",
    accountName: "أحمد زغلول - تصويرك",
    iban: "SA0000000000000000000000",
    accountNumber: "0000000000000",
  },
  cms: {
    heroTitle: "تعلّم التصوير من الصفر للاحتراف",
    heroSubtitle: "دورات مباشرة مع أحمد زغلول في جدة",
    footerNote: "© 2026 تصويرك — جميع الحقوق محفوظة",
  },
  flags: {
    enableSignup: true,
    enableImpersonation: true,
    enableCertificates: true,
    enablePublicCourses: true,
    maintenanceMode: false,
    requireEmailVerification: false,
  },
  auditPolicy: {
    logAuth: true,
    logPayments: true,
    logContentChanges: true,
    retentionDays: "365",
  },
};

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "غير مسجّل" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "صلاحيات غير كافية" }, { status: 403 });
    }

    const result: any = {};
    for (const key of Object.keys(defaults)) {
      const stored = await getCmsValue(key);
      if (stored) {
        try {
          result[key] = { ...(defaults as any)[key], ...JSON.parse(stored) };
        } catch {
          result[key] = (defaults as any)[key];
        }
      } else {
        result[key] = (defaults as any)[key];
      }
    }

    return NextResponse.json({ ok: true, settings: result });
  } catch (err) {
    console.error("[admin/settings GET] error:", err);
    return NextResponse.json({ ok: false, error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "غير مسجّل" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "صلاحيات غير كافية" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message || "بيانات غير صحيحة" },
        { status: 400 }
      );
    }

    const { section, smtp, minio, bank, cms, flags, auditPolicy } = parsed.data;

    let dataToSave: any = null;
    if (section === "smtp" && smtp) dataToSave = smtp;
    else if (section === "minio" && minio) dataToSave = minio;
    else if (section === "bank" && bank) dataToSave = bank;
    else if (section === "cms" && cms) dataToSave = cms;
    else if (section === "flags" && flags) dataToSave = flags;
    else if (section === "auditPolicy" && auditPolicy) dataToSave = auditPolicy;

    if (dataToSave) {
      await setCmsValue(section, JSON.stringify(dataToSave));
    }

    await writeAudit({
      userId: session.user.id,
      action: "ADMIN_SETTINGS_UPDATE",
      entity: "CmsContent",
      entityId: section,
      metadata: { section, role: "ADMIN" },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({
      ok: true,
      message: "تم حفظ الإعدادات بنجاح",
      section,
      data: dataToSave,
    });
  } catch (err) {
    console.error("[admin/settings PUT] error:", err);
    return NextResponse.json({ ok: false, error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
