// ====================================================================
// POST /api/auth/forgot-password
// Body: { email }
// Generates a reset token, stores it, emails the user a reset link.
// Always returns 200 (don't leak whether email exists)
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/services/email";
import { rateLimitPresets, getClientIP } from "@/lib/services/rate-limit";

const schema = z.object({
  email: z.string().email("بريد غير صحيح"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);
    const rl = rateLimitPresets.forgotPassword(ip);
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
        { ok: false, error: parsed.error.issues[0]?.message || "بريد غير صحيح" },
        { status: 400 }
      );
    }
    const email = parsed.data.email.toLowerCase().trim();

    // Look up user (but don't leak existence)
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    });

    if (user) {
      // Generate reset token (valid for 1 hour)
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store token in VerificationToken table (Auth.js standard)
      // First, delete old tokens for this email to prevent accumulation
      await db.verificationToken.deleteMany({
        where: { identifier: email },
      });
      await db.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
        },
      });

      // Send reset email
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const resetUrl = `${baseUrl}/forgot-password?token=${token}`;

      try {
        await sendEmail({
          to: email,
          subject: "إعادة تعيين كلمة المرور | تصويرك",
          templateId: "PASSWORD_RESET",
          data: { name: user.name, resetUrl },
          text: `أهلاً ${user.name || ""}،

تلقّينا طلباً لإعادة تعيين كلمة المرور لحسابك في تصويرك.

اضغط الرابط التالي لإعادة التعيين (صالح لمدة ساعة):
${resetUrl}

إذا لم تطلب هذا، تجاهل هذه الرسالة — لن يتغيّر anything.

تحياتنا،
فريق تصويرك`,
          html: `
<div dir="rtl" style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
  <div style="background: linear-gradient(135deg, #0A9ED9, #00A3AA, #D65221); padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
    <div style="color: white; font-size: 24px; font-weight: 800;">تصويرك</div>
  </div>
  <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
    <h1 style="color: #0A9ED9; margin-top: 0;">إعادة تعيين كلمة المرور</h1>
    <p style="color: #374151; line-height: 1.7;">
      أهلاً <strong>${(user.name || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</strong>،
    </p>
    <p style="color: #374151; line-height: 1.7;">
      تلقّينا طلباً لإعادة تعيين كلمة المرور لحسابك. اضغط الزر التالي
      لاختيار كلمة مرور جديدة. الرابط صالح لمدة ساعة واحدة فقط.
    </p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #0A9ED9, #00A3AA, #D65221); color: white; padding: 12px 28px; border-radius: 12px; text-decoration: none; font-weight: 600;">
        إعادة تعيين كلمة المرور
      </a>
    </div>
    <p style="color: #6b7280; font-size: 13px;">
      إذا لم تطلب إعادة التعيين، يمكنك تجاهل هذه الرسالة — لن يتغيّر شيء في حسابك.
    </p>
  </div>
</div>
`,
        });
      } catch (err) {
        console.error("[forgot-password] email send failed:", err);
      }
    }

    // Always return success (don't leak whether email exists)
    return NextResponse.json({
      ok: true,
      message: "إذا كان البريد مسجّلاً، ستصلك رسالة بإعادة التعيين خلال دقائق.",
    });
  } catch (err) {
    console.error("[forgot-password] error:", err);
    return NextResponse.json(
      { ok: false, error: "حدث خطأ غير متوقع" },
      { status: 500 }
    );
  }
}
