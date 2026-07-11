// ====================================================================
// Marketing Email Service
// Sends: welcome email, drip campaigns, monthly newsletter, special offers
//
// Supports: simulation mode (dev) + SMTP (production)
// For Mailchimp/SendGrid integration, add API key in env vars
// ====================================================================

import { sendEmail } from "@/lib/services/email";
import { db } from "@/lib/db";

export type MarketingTemplate = "WELCOME" | "DripReminder" | "MonthlyNewsletter" | "SpecialOffer";

interface MarketingEmailPayload {
  to: string;
  studentName: string;
  template: MarketingTemplate;
  data?: Record<string, any>;
}

/**
 * Send a marketing email to a student.
 * In simulation mode, logs to console + saves to /upload/_emails/
 */
export async function sendMarketingEmail({ to, studentName, template, data }: MarketingEmailPayload) {
  const payload = renderMarketingTemplate(template, studentName, data);
  return sendEmail({
    to,
    subject: payload.subject,
    templateId: template as any,
    data: { studentName, ...data },
    text: payload.text,
    html: payload.html,
  });
}

function renderMarketingTemplate(template: MarketingTemplate, name: string, data?: Record<string, any>) {
  switch (template) {
    case "WELCOME":
      return {
        subject: `أهلاً بك في تصويرك، ${name}! 📸`,
        text: `أهلاً ${name}،

نرحّب بك في منصة تصويرك — رحلتك نحو احتراف التصوير تبدأ من هنا.

دوراتنا المتاحة:
- أساسيات التصوير (499 ر.س)
- تصوير البيوتي Beauty (899 ر.س)
- ميكب توتوريال (599 ر.س)

تصفّح الدورات على: ${process.env.NEXTAUTH_URL || ""}/courses

إذا كان لديك أي سؤال، لا تتردد في فتح تذكرة دعم من لوحة التحكم.

نتمنى لك رحلة تعلّم ممتعة!
فريق تصويرك`,
        html: marketingWrapper(`
          <h1 style="color: #0A9ED9; margin-top: 0;">أهلاً ${name}! 📸</h1>
          <p>نرحّب بك في منصة تصويرك — رحلتك نحو احتراف التصوير تبدأ من هنا.</p>
          <p>دوراتنا المتاحة:</p>
          <ul style="padding-right: 20px;">
            <li><strong>أساسيات التصوير</strong> — 499 ر.س</li>
            <li><strong>تصوير البيوتي Beauty</strong> — 899 ر.س</li>
            <li><strong>ميكب توتوريال</strong> — 599 ر.س</li>
          </ul>
          <a href="${process.env.NEXTAUTH_URL || ""}/courses" style="display: inline-block; background: linear-gradient(135deg, #0A9ED9, #00A3AA, #D65221); color: white; padding: 12px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; margin-top: 16px;">
            تصفّح الدورات
          </a>
        `),
      };

    case "DripReminder":
      return {
        subject: `${name}، واصل رحلتك في التصوير! 🎯`,
        text: `أهلاً ${name}،

لاحظنا أنك لم تكمل دورتك بعد. تذكّر: كل درس تكمله يقربك خطوة من الشهادة.

أكمل الآن: ${process.env.NEXTAUTH_URL || ""}/student/courses

نحن هنا لدعمك في كل خطوة.
فريق تصويرك`,
        html: marketingWrapper(`
          <h1 style="color: #D65221; margin-top: 0;">${name}، واصل رحلتك! 🎯</h1>
          <p>لاحظنا أنك لم تكمل دورتك بعد. تذكّر: كل درس تكمله يقربك خطوة من الشهادة.</p>
          <a href="${process.env.NEXTAUTH_URL || ""}/student/courses" style="display: inline-block; background: linear-gradient(135deg, #0A9ED9, #00A3AA, #D65221); color: white; padding: 12px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; margin-top: 16px;">
            أكمل الدورة الآن
          </a>
        `),
      };

    case "MonthlyNewsletter":
      return {
        subject: `رسالة تصويرك الشهرية — ${data?.month || "يوليو"} ${data?.year || "2026"}`,
        text: `أهلاً ${name}،

إليك أهم ما حدث في تصويرك هذا الشهر:

${data?.highlights || "· دورات جديدة قريباً\n· عروض خاصة للأعضاء"}

تصفّح المنصة: ${process.env.NEXTAUTH_URL || ""}

شكراً لكونك جزءاً من مجتمع تصويرك!`,
        html: marketingWrapper(`
          <h1 style="color: #00A3AA; margin-top: 0;">رسالة شهرية</h1>
          <p>أهلاً ${name}،</p>
          <p>إليك أهم ما حدث في تصويرك هذا الشهر:</p>
          <div style="background: #f0fdfa; border: 1px solid #ccfbf1; padding: 16px; border-radius: 12px; margin: 16px 0;">
            ${data?.highlightsHtml || "<p>· دورات جديدة قريباً<br/>· عروض خاصة للأعضاء</p>"}
          </div>
          <a href="${process.env.NEXTAUTH_URL || ""}" style="display: inline-block; background: linear-gradient(135deg, #0A9ED9, #00A3AA, #D65221); color: white; padding: 12px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; margin-top: 16px;">
            تصفّح المنصة
          </a>
        `),
      };

    case "SpecialOffer":
      return {
        subject: `عرض خاص لك يا ${name}! 🔥`,
        text: `أهلاً ${name}،

${data?.offerText || "عرض خاص لفترة محدودة!"}

استخدم الكود: ${data?.couponCode || "SPECIAL20"}
الخصم: ${data?.discount || "20%"}

سجّل الآن: ${process.env.NEXTAUTH_URL || ""}/courses

العرض ينتهي: ${data?.expiresAt || "قريباً"}
فريق تصويرك`,
        html: marketingWrapper(`
          <h1 style="color: #D65221; margin-top: 0;">عرض خاص لك! 🔥</h1>
          <p>${data?.offerText || "عرض خاص لفترة محدودة!"}</p>
          <div style="background: #fef3c7; border: 2px dashed #D65221; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
            <div style="font-size: 14px; color: #6b7280;">استخدم الكود:</div>
            <div style="font-size: 28px; font-weight: 800; color: #D65221; font-family: monospace; margin: 8px 0;">${data?.couponCode || "SPECIAL20"}</div>
            <div style="font-size: 16px; color: #1f2937;">الخصم: ${data?.discount || "20%"}</div>
          </div>
          <a href="${process.env.NEXTAUTH_URL || ""}/courses" style="display: inline-block; background: linear-gradient(135deg, #0A9ED9, #00A3AA, #D65221); color: white; padding: 12px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; margin-top: 16px;">
            سجّل الآن
          </a>
          <p style="font-size: 12px; color: #6b7280; margin-top: 16px;">العرض ينتهي: ${data?.expiresAt || "قريباً"}</p>
        `),
      };

    default:
      return {
        subject: `رسالة من تصويرك`,
        text: `أهلاً ${name}، هذا إشعار من منصة تصويرك.`,
        html: marketingWrapper(`<p>أهلاً ${name}،</p><p>هذا إشعار من منصة تصويرك.</p>`),
      };
  }
}

function marketingWrapper(content: string): string {
  return `
<div dir="rtl" style="font-family: 'Tajawal', system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
  <div style="background: linear-gradient(135deg, #0A9ED9, #00A3AA, #D65221); padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
    <div style="color: white; font-size: 28px; font-weight: 800;">تصويرك</div>
  </div>
  <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
    ${content}
    <p style="color: #6b7280; font-size: 13px; margin-top: 24px;">
      تحياتنا،<br/>فريق تصويرك
    </p>
  </div>
  <div style="text-align: center; padding: 16px; font-size: 11px; color: #9ca3af;">
    <p>© 2026 تصويرك — جميع الحقوق محفوظة</p>
    <p><a href="${process.env.NEXTAUTH_URL || ""}/privacy" style="color: #6b7280;">سياسة الخصوصية</a> · <a href="${process.env.NEXTAUTH_URL || ""}/terms" style="color: #6b7280;">الشروط</a> · <a href="#" style="color: #6b7280;">إلغاء الاشتراك</a></p>
  </div>
</div>
`;
}

/**
 * Send welcome email to a newly registered student.
 */
export async function sendWelcomeEmail(studentId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: studentId },
      select: { email: true, name: true },
    });
    if (!user) return;
    await sendMarketingEmail({
      to: user.email,
      studentName: user.name || "طالب",
      template: "WELCOME",
    });
  } catch (err) {
    console.warn("[marketing] welcome email failed:", err);
  }
}

/**
 * Send drip reminder to students who haven't progressed in 7 days.
 */
export async function sendDripReminders() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const students = await db.enrollment.findMany({
      where: {
        status: "ACTIVE",
        updatedAt: { lt: sevenDaysAgo },
      },
      include: {
        student: { select: { email: true, name: true } },
      },
      take: 100,
    });

    for (const enr of students) {
      await sendMarketingEmail({
        to: enr.student.email,
        studentName: enr.student.name || "طالب",
        template: "DripReminder",
      });
    }

    console.log(`[marketing] sent ${students.length} drip reminders`);
  } catch (err) {
    console.warn("[marketing] drip reminders failed:", err);
  }
}

/**
 * Send monthly newsletter to all active students.
 */
export async function sendMonthlyNewsletter(highlights: string, highlightsHtml: string) {
  try {
    const students = await db.user.findMany({
      where: { role: "STUDENT" },
      select: { email: true, name: true },
      take: 1000,
    });

    const month = new Date().toLocaleDateString("ar-SA", { month: "long" });
    const year = new Date().getFullYear();

    for (const s of students) {
      await sendMarketingEmail({
        to: s.email,
        studentName: s.name || "طالب",
        template: "MonthlyNewsletter",
        data: { month, year, highlights, highlightsHtml },
      });
    }

    console.log(`[marketing] sent ${students.length} newsletters`);
  } catch (err) {
    console.warn("[marketing] newsletter failed:", err);
  }
}
