// ====================================================================
// Taswerak — Email service
// Mode: "simulation" (default in dev) | "smtp" (production)
// In simulation mode, emails are logged to console + saved to a file
// under /home/z/my-project/upload/_emails/ for easy review.
// ====================================================================

import { promises as fs } from "fs";
import path from "path";

type Transport = "simulation" | "smtp";

const transport: Transport = (process.env.EMAIL_TRANSPORT as Transport) || "simulation";
const fromAddress = process.env.EMAIL_FROM || "Taswerak <no-reply@taswerak.com>";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  templateId: EmailTemplate;
  data: Record<string, unknown>;
}

export type EmailTemplate =
  | "PAYMENT_APPROVED"
  | "PAYMENT_REJECTED"
  | "CERTIFICATE_ISSUED"
  | "CRITIQUE_RECEIVED"
  | "WELCOME"
  | "PASSWORD_RESET";

/**
 * Send an email using the configured transport.
 * In simulation mode, the email is logged + saved to disk for review.
 */
export async function sendEmail(payload: EmailPayload): Promise<{ ok: boolean; mode: Transport }> {
  if (transport === "simulation") {
    return simulateEmail(payload);
  }

  return smtpEmail(payload);
}

async function simulateEmail(payload: EmailPayload): Promise<{ ok: boolean; mode: Transport }> {
  const { to, subject, html, text, templateId, data } = payload;
  const stamp = new Date().toISOString();
  const summary = `[${stamp}] TO: ${to}\nSUBJECT: ${subject}\nTEMPLATE: ${templateId}\nDATA: ${JSON.stringify(data)}\n----\n${text || "(no plain text body)"}\n================\n`;

  console.log("━━━━━━━━━━━━━━ EMAIL (simulation) ━━━━━━━━━━━━━━");
  console.log(summary);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Persist to disk so admin can review in dev
  try {
    const dir = "/home/z/my-project/upload/_emails";
    await fs.mkdir(dir, { recursive: true });
    const safeFile = `${stamp.replace(/[:.]/g, "-")}_${templateId}.log`;
    await fs.writeFile(
      path.join(dir, safeFile),
      `${summary}\n\nHTML:\n${html}\n`
    );
  } catch (err) {
    console.warn("[email] could not persist simulation log:", err);
  }

  return { ok: true, mode: "simulation" };
}

async function smtpEmail(payload: EmailPayload): Promise<{ ok: boolean; mode: Transport }> {
  try {
    // Lazy import so the dependency only loads when needed
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: parseInt(process.env.SMTP_PORT || "587", 10) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: fromAddress,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });

    return { ok: true, mode: "smtp" };
  } catch (err) {
    console.error("[email] SMTP failed:", err);
    // Fall back to simulation so we don't lose the email
    return simulateEmail(payload);
  }
}

// ====================================================================
// Templates
// ====================================================================

export function renderPaymentApprovedEmail(opts: {
  studentName: string;
  courseName: string;
  amount: number;
  currency: string;
}): EmailPayload {
  const { studentName, courseName, amount, currency } = opts;
  return {
    to: "", // filled by caller
    subject: `تم اعتماد دفعتك — ${courseName} | تصويرك`,
    templateId: "PAYMENT_APPROVED",
    data: opts,
    text: `أهلاً ${studentName}،

تم اعتماد دفعتك بمبلغ ${amount} ${currency} لدورة "${courseName}".

يمكنك الآن البدء في الدورة من لوحة التحكم:
http://localhost:3000/student/courses

تحياتنا،
فريق تصويرك`,
    html: `
<div dir="rtl" style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
  <div style="background: linear-gradient(135deg, #0A9ED9, #00A3AA, #D65221); padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
    <div style="color: white; font-size: 28px; font-weight: 800;">تصويرك</div>
  </div>
  <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
    <h1 style="font-size: 22px; color: #0A9ED9; margin-top: 0;">تم اعتماد دفعتك ✅</h1>
    <p style="color: #374151; line-height: 1.7;">أهلاً <strong>${studentName}</strong>،</p>
    <p style="color: #374151; line-height: 1.7;">
      تم اعتماد دفعتك بمبلغ <strong>${amount} ${currency}</strong> لدورة
      <strong>"${courseName}"</strong>. يمكنك الآن البدء في مشاهددة المحاضرات
      ورفع أعمالك للنقد.
    </p>
    <a href="http://localhost:3000/student/courses" style="display: inline-block; background: linear-gradient(135deg, #0A9ED9, #00A3AA, #D65221); color: white; padding: 12px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; margin-top: 16px;">
      ابدأ الدورة الآن
    </a>
    <p style="color: #6b7280; font-size: 13px; margin-top: 24px;">
      تحياتنا،<br/>فريق تصويرك
    </p>
  </div>
</div>
`,
  };
}

export function renderPaymentRejectedEmail(opts: {
  studentName: string;
  courseName: string;
  amount: number;
  currency: string;
  rejectionReason: string;
}): EmailPayload {
  const { studentName, courseName, amount, currency, rejectionReason } = opts;
  return {
    to: "",
    subject: `تحتاج دفعتك لمراجعة — ${courseName} | تصويرك`,
    templateId: "PAYMENT_REJECTED",
    data: opts,
    text: `أهلاً ${studentName}،

للأسف لم نتمكن من اعتماد دفعتك بمبلغ ${amount} ${currency} لدورة "${courseName}".

السبب: ${rejectionReason}

يمكنك رفع إيصال جديد من لوحة التحكم:
http://localhost:3000/student/payments

تحياتنا،
فريق تصويرك`,
    html: `
<div dir="rtl" style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
  <div style="background: linear-gradient(135deg, #0A9ED9, #00A3AA, #D65221); padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
    <div style="color: white; font-size: 28px; font-weight: 800;">تصويرك</div>
  </div>
  <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
    <h1 style="font-size: 22px; color: #D65221; margin-top: 0;">تحتاج دفعتك لمراجعة ⚠️</h1>
    <p style="color: #374151; line-height: 1.7;">أهلاً <strong>${studentName}</strong>،</p>
    <p style="color: #374151; line-height: 1.7;">
      للأسف لم نتمكن من اعتماد دفعتك بمبلغ <strong>${amount} ${currency}</strong>
      لدورة <strong>"${courseName}"</strong>.
    </p>
    <div style="background: #fef3c7; border: 1px solid #fde68a; padding: 12px 16px; border-radius: 12px; margin: 16px 0;">
      <strong>السبب:</strong> ${rejectionReason}
    </div>
    <p style="color: #374151; line-height: 1.7;">
      يمكنك رفع إيصال جديد بعد التحقق من البيانات.
    </p>
    <a href="http://localhost:3000/student/payments" style="display: inline-block; background: linear-gradient(135deg, #0A9ED9, #00A3AA, #D65221); color: white; padding: 12px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; margin-top: 16px;">
      رفع إيصال جديد
    </a>
    <p style="color: #6b7280; font-size: 13px; margin-top: 24px;">
      تحياتنا،<br/>فريق تصويرك
    </p>
  </div>
</div>
`,
  };
}

export function renderCertificateIssuedEmail(opts: {
  studentName: string;
  courseName: string;
  certificateNumber: string;
  grade: string;
}): EmailPayload {
  const { studentName, courseName, certificateNumber, grade } = opts;
  return {
    to: "",
    subject: `شهادتك جاهزة — ${courseName} | تصويرك`,
    templateId: "CERTIFICATE_ISSUED",
    data: opts,
    text: `أهلاً ${studentName}،

مبروك! تم إصدار شهادتك لإتمام دورة "${courseName}".

رقم الشهادة: ${certificateNumber}
التقدير: ${grade}

حمّل شهادتك من:
http://localhost:3000/student/certificates

تحياتنا،
فريق تصويرك`,
    html: `
<div dir="rtl" style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
  <div style="background: linear-gradient(135deg, #0A9ED9, #00A3AA, #D65221); padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
    <div style="color: white; font-size: 28px; font-weight: 800;">تصويرك</div>
  </div>
  <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
    <h1 style="font-size: 22px; color: #00A3AA; margin-top: 0;">شهادتك جاهزة 🎓</h1>
    <p style="color: #374151; line-height: 1.7;">مبروك <strong>${studentName}</strong>،</p>
    <p style="color: #374151; line-height: 1.7;">
      تم إصدار شهادتك لإتمام دورة <strong>"${courseName}"</strong>.
    </p>
    <div style="background: #f0fdfa; border: 1px solid #ccfbf1; padding: 16px; border-radius: 12px; margin: 16px 0; text-align: center;">
      <div style="font-size: 12px; color: #6b7280;">رقم الشهادة</div>
      <div style="font-family: monospace; font-weight: 700; font-size: 16px; color: #00A3AA; letter-spacing: 1px;">${certificateNumber}</div>
      <div style="font-size: 12px; color: #6b7280; margin-top: 8px;">التقدير: <strong>${grade}</strong></div>
    </div>
    <a href="http://localhost:3000/student/certificates" style="display: inline-block; background: linear-gradient(135deg, #0A9ED9, #00A3AA, #D65221); color: white; padding: 12px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; margin-top: 16px;">
      تحميل الشهادة
    </a>
  </div>
</div>
`,
  };
}
