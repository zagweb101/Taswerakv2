// ====================================================================
// POST /api/chatbot
// AI chatbot using z-ai-web-dev-sdk
// Answers student questions about courses, payments, platform usage
// Falls back to "contact support" if AI is unavailable
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { chatbotSchema } from "@/lib/validations";
import { rateLimit, getClientIP } from "@/lib/services/rate-limit";

// Use shared schema from validations/index.ts
const schema = chatbotSchema;

// Taswerak knowledge base — injected as system prompt
const SYSTEM_PROMPT = `أنت "تصويرك بوت" — المساعد الذكي لمنصة تصويرك لتعليم التصوير الفوتوغرافي.

معلومات عن المنصة:
- المنصة تعلّم التصوير الفوتوغرافي من الصفر للاحتراف
- المدرّب: أحمد زغلول (مصور محترف في جدة، السعودية)
- 3 دورات متاحة:
  1. أساسيات التصوير (499 ر.س) — مبتدئ، 12 ساعة
  2. تصوير البيوتي Beauty (899 ر.س) — متوسط، 24 ساعة، 12 محاضرة
  3. ميكب توتوريال (599 ر.س) — متوسط، 16 ساعة

طريقة التسجيل والدفع:
- يسجّل الطالب حساب → يختار دورة → يرفع إيصال تحويل بنكي → المدرّب يعتمد ← يبدأ التعلّم
- الدفع حالياً يدوي (تحويل بنكي) + دفع إلكتروني قريباً (مدى، Apple Pay)

الميزات:
- مشغل فيديو مع تتبّع التقدّم
- واجبات مع نقد تفصيلي (Pin comments على الصور)
- شهادات PDF موثّقة بـ QR code
- نظام إحالات (50 ر.س لكل صديق)
- نظام كوبونات خصم
- دعم فني عبر تذاكر

قواعد الإجابة:
- أجب بالعربي دائماً
- كن مختصراً وودوداً
- إذا سُئلت عن شيء لا تعرفه، قل "للأسف لا أملك هذه المعلومات، تواصل مع الدعم على info@taswerak.com"
- لا تختلق أسعار أو معلومات غير موجودة above
- إذا كان السؤال يتطلب دخول للحساب، قل "سجّل دخولك أولاً"`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message || "بيانات غير صحيحة" },
        { status: 400 }
      );
    }
    const { message, history } = parsed.data;

    // Rate limit: 20 messages per hour per IP (chatbot is public)
    const ip = getClientIP(req);
    const rl = rateLimit({ key: `chatbot:${ip}`, limit: 20, windowMs: 60 * 60 * 1000 });
    if (!rl.success) {
      return NextResponse.json(
        { ok: false, error: "محاولات كثيرة. حاول بعد ساعة." },
        { status: 429 }
      );
    }

    // Try Z.AI SDK
    try {
      const ZAI = (await import("z-ai-web-dev-sdk")).default;
      const zai = await ZAI.create();

      const messages = [
        { role: "system" as const, content: SYSTEM_PROMPT },
        ...history.map((h) => ({
          role: h.role as "user" | "assistant",
          content: h.content,
        })),
        { role: "user" as const, content: message },
      ];

      const response = await zai.chat.completions.create({
        messages,
        temperature: 0.7,
        max_tokens: 500,
      });

      const reply = response.choices?.[0]?.message?.content || "عذراً، لم أتمكن من الرد الآن. حاول مرة أخرى.";

      return NextResponse.json({
        ok: true,
        reply,
        source: "ai",
      });
    } catch (aiErr) {
      console.error("[chatbot] AI failed:", aiErr);
      // Fallback to rule-based responses
      const fallback = getFallbackResponse(message);
      return NextResponse.json({
        ok: true,
        reply: fallback,
        source: "fallback",
      });
    }
  } catch (err) {
    console.error("[chatbot] error:", err);
    return NextResponse.json(
      { ok: false, error: "حدث خطأ غير متوقع" },
      { status: 500 }
    );
  }
}

// Rule-based fallback when AI is unavailable
function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("سعر") || lower.includes("كم") || lower.includes("تكلفة")) {
    return `أسعار دوراتنا:
📸 أساسيات التصوير: 499 ر.س
📸 تصوير البيوتي: 899 ر.س
📸 ميكب توتوريال: 599 ر.س

للتسجيل: تصفّح الدورات واختر ما يناسبك!`;
  }

  if (lower.includes("دفع") || lower.includes("تحويل") || lower.includes("بنك")) {
    return `طرق الدفع:
✅ تحويل بنكي (يدوي — ارفع الإيصال)
🔜 دفع إلكتروني (مدى، Apple Pay) — قريباً

بعد التسجيل في دورة، اذهب لصفحة الدفع وارفع صورة إيصال التحويل. سيتم اعتماده خلال 24 ساعة.`;
  }

  if (lower.includes("شهادة") || lower.includes("certificate")) {
    return `نعم! نوفّر شهادة PDF موثّقة بـ QR code عند إكمال الدورة.
يمكن لأي جهة التحقق من الشهادة عبر مسح الـ QR.`;
  }

  if (lower.includes("وقت") || lower.includes("مدة") || lower.includes("ساعة")) {
    return `مدة كل دورة:
📸 أساسيات التصوير: 12 ساعة
📸 تصوير البيوتي: 24 ساعة (12 محاضرة)
📸 ميكب توتوريال: 16 ساعة

تتعلم بالسرعة التي تناسبك — الوصول مدى الحياة!`;
  }

  if (lower.includes("تواصل") || lower.includes("دعم") || lower.includes("مساعدة")) {
    return `للتواصل:
📧 البريد: info@taswerak.com
🎫 تذكرة دعم: من لوحة التحكم → الدعم الفني
📱 واتساب: متوفر في أسفل الموقع

سنردّ خلال 24 ساعة.`;
  }

  if (lower.includes("مرحبا") || lower.includes("السلام") || lower.includes("هاي")) {
    return `أهلاً بك في تصويرك! 📸
كيف أقدر أساعدك؟ يمكنني الإجابة عن:
- الأسعار والدورات
- طريقة الدفع
- الشهادات
- المدة
- الدعم الفني`;
  }

  return `عذراً، لم أفهم سؤالك تماماً. 
يمكنني مساعدتك في:
- الأسعار والدورات المتاحة
- طريقة الدفع والتسجيل
- الشهادات والتقدّم
- الدعم الفني

أو تواصل معنا: info@taswerak.com`;
}
