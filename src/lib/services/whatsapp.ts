// ====================================================================
// WhatsApp integration service
// - Click-to-chat links
// - Notification templates
// - Auto-replies for common questions
//
// Prerequisites: WhatsApp Business account (https://wa.me/business)
// For API sending: Twilio WhatsApp API or WhatsApp Cloud API
// ====================================================================

const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || ""; // e.g., "9665XXXXXXXX"

/**
 * Generate a WhatsApp click-to-chat link.
 * Opens WhatsApp with a pre-filled message.
 */
export function getWhatsAppLink(message?: string): string {
  const base = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : "https://wa.me/";
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Get the support WhatsApp link for the footer/contact.
 */
export function getSupportWhatsAppLink(): string {
  return getWhatsAppLink("السلام عليكم، أحتاج مساعدة بخصوص منصة تصويرك");
}

interface WhatsAppNotification {
  to: string; // phone number with country code (e.g., "9665XXXXXXXX")
  message: string;
}

/**
 * Send a WhatsApp notification.
 * Supports 3 providers (checked in order):
 *   1. Whapi.cloud (WHAPI_API_KEY) — easiest to set up
 *   2. WhatsApp Cloud API / Meta (WHATSAPP_TOKEN + WHATSAPP_PHONE_NUMBER_ID)
 *   3. No-op if neither configured
 *
 * Whapi.cloud setup:
 *   1. Create account at https://whapi.cloud
 *   2. Get API key from dashboard
 *   3. Set WHAPI_API_KEY in env vars
 *   4. Set WHATSAPP_NUMBER (your WhatsApp Business number)
 */
export async function sendWhatsAppNotification({ to, message }: WhatsAppNotification): Promise<boolean> {
  // ── Try Whapi.cloud first (easier setup) ──
  const whapiToken = process.env.WHAPI_API_KEY;
  if (whapiToken) {
    try {
      const res = await fetch("https://api.whapi.cloud/messages/text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${whapiToken}`,
        },
        body: JSON.stringify({
          to: to,
          body: message,
        }),
      });
      return res.ok;
    } catch (err) {
      console.warn("[whatsapp] Whapi send failed:", err);
      // Fall through to Meta Cloud API
    }
  }

  // ── Try WhatsApp Cloud API (Meta) ──
  const metaToken = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (metaToken && phoneNumberId) {
    try {
      const res = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${metaToken}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: message },
        }),
      });
      return res.ok;
    } catch (err) {
      console.warn("[whatsapp] Meta Cloud API send failed:", err);
      return false;
    }
  }

  // Neither configured — skip silently
  return false;
}

/**
 * Send payment approved notification via WhatsApp.
 */
export function paymentApprovedWhatsApp(courseName: string): string {
  return `✅ تم اعتماد دفعتك!

دورتك "${courseName}" أصبحت متاحة الآن.
ابدأ التعلّم: ${process.env.NEXTAUTH_URL || ""}/student/courses

— تصويرك 📸`;
}

/**
 * Send critique received notification via WhatsApp.
 */
export function critiqueReceivedWhatsApp(courseName: string): string {
  return `📷 نقد جديد على عملك!

أضاف المدرّب نقداً تفصيلياً على عملك في "${courseName}".
شاهد النقد: ${process.env.NEXTAUTH_URL || ""}/student/courses

— تصويرك 📸`;
}

/**
 * Send certificate issued notification via WhatsApp.
 */
export function certificateIssuedWhatsApp(courseName: string, certNumber: string): string {
  return `🎉 مبروك! شهادتك جاهزة!

أكملت دورة "${courseName}".
رقم الشهادة: ${certNumber}
حمّل شهادتك: ${process.env.NEXTAUTH_URL || ""}/student/certificates

— تصويرك 📸`;
}

/**
 * Common questions auto-reply (for FAQ bot if integrated).
 */
export const whatsappAutoReplies: Record<string, string> = {
  "سعر": `أسعار دوراتنا:
• أساسيات التصوير: 499 ر.س
• تصوير البيوتي: 899 ر.س
• ميكب توتوريال: 599 ر.س

للتفاصيل: ${process.env.NEXTAUTH_URL || ""}/courses`,
  "دفع": `طرق الدفع:
• تحويل بنكي (يدوي — ارفع الإيصال)
• دفع إلكتروني (مدى، فيزا، Apple Pay) — قريباً

بيانات الحساب البنكي تظهر بعد اختيار الدورة.`,
  "مدة": `مدة كل دورة:
• أساسيات التصوير: 12 ساعة
• تصوير البيوتي: 24 ساعة (12 محاضرة)
• ميكب توتوريال: 16 ساعة

تتعلم بالسرعة التي تناسبك — الوصول مدى الحياة.`,
  "شهادة": `نعم، نوفّر شهادة موثّقة بـ QR code عند إكمال الدورة.
يمكن لأي جهة التحقق من صحة الشهادة عبر مسح الـ QR.`,
  "تواصل": `للتواصل المباشر:
• البريد: info@taswerak.com
• أو افتح تذكرة دعم من لوحة التحكم
سنردّ خلال 24 ساعة.`,
};
