// ====================================================================
// POST /api/contact
// Receive contact form submission + email admin
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/services/email";
import { rateLimitPresets, getClientIP } from "@/lib/services/rate-limit";
import { writeAudit } from "@/lib/services/audit";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Use shared schema from validations/index.ts
const schema = contactSchema;

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 3 contact messages per hour per IP
    const ip = getClientIP(req);
    const rl = rateLimitPresets.contact(ip);
    if (!rl.success) {
      return NextResponse.json(
        { ok: false, error: "محاولات كثيرة. حاول بعد ساعة." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message || "بيانات غير صحيحة" },
        { status: 400 }
      );
    }
    const { name, email, phone, subject, message } = parsed.data;

    // Try to send email to admin
    const adminEmail = process.env.EMAIL_FROM || "info@taswerak.com";
    try {
      await sendEmail({
        to: adminEmail,
        subject: `[تصويرك] رسالة تواصل جديدة: ${subject}`,
        templateId: "WELCOME" as any,
        data: { name, email, phone, subject, message },
        text: `رسالة تواصل جديدة من ${name} <${email}>${phone ? ` (${phone})` : ""}

الموضوع: ${subject}

الرسالة:
${message}

---
أرسل من نموذج التواصل على taswerak.com`,
        html: `
<div dir="rtl" style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
  <div style="background: linear-gradient(135deg, #0A9ED9, #00A3AA, #D65221); padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
    <div style="color: white; font-size: 24px; font-weight: 800;">تصويرك — رسالة تواصل</div>
  </div>
  <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
    <h2 style="color: #0A9ED9; margin-top: 0;">${escapeHtml(subject)}</h2>
    <table style="width: 100%; margin-bottom: 16px;">
      <tr><td style="padding: 4px 0; color: #6b7280; width: 80px;">الاسم:</td><td style="font-weight: 600;">${escapeHtml(name)}</td></tr>
      <tr><td style="padding: 4px 0; color: #6b7280;">البريد:</td><td style="font-weight: 600;" dir="ltr">${escapeHtml(email)}</td></tr>
      ${phone ? `<tr><td style="padding: 4px 0; color: #6b7280;">الجوال:</td><td style="font-weight: 600;" dir="ltr">${escapeHtml(phone)}</td></tr>` : ""}
    </table>
    <div style="background: #f9fafb; padding: 16px; border-radius: 12px; border: 1px solid #e5e7eb;">
      <div style="color: #6b7280; font-size: 12px; margin-bottom: 8px;">الرسالة:</div>
      <p style="margin: 0; line-height: 1.7; white-space: pre-wrap;">${escapeHtml(message)}</p>
    </div>
  </div>
</div>
`,
      });
    } catch (err) {
      console.error("[contact] email send failed:", err);
      // Continue — at least we got the message
    }

    // Audit
    await writeAudit({
      action: "CONTACT_FORM",
      entity: "Contact",
      metadata: { name, email, subject },
      ipAddress: ip,
    });

    return NextResponse.json({
      ok: true,
      message: "تم استلام رسالتك! سنردّ خلال 24 ساعة.",
    });
  } catch (err) {
    console.error("[contact] error:", err);
    return NextResponse.json(
      { ok: false, error: "حدث خطأ غير متوقع" },
      { status: 500 }
    );
  }
}
