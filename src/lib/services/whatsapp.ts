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
 * Currently uses WhatsApp Cloud API (Meta) if configured.
 * Falls back to no-op if not configured.
 *
 * To enable: set WHATSAPP_TOKEN + WHATSAPP_PHONE_NUMBER_ID env vars
 */
export async function sendWhatsAppNotification({ to, message }: WhatsAppNotification): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    // Not configured — skip silently
    return false;
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
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
    console.warn("[whatsapp] send failed:", err);
    return false;
  }
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
