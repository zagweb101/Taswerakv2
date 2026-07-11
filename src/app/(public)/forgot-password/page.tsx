"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { brandGradientText } from "@/lib/brand";

export default function ForgotPasswordPage() {
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error || "فشل الإرسال");
        }
        setSent(true);
        toast.success(data.message);
      } catch (err: any) {
        toast.error(err.message || "فشل الإرسال");
      }
    });
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-bl from-[#0A9ED9]/8 via-[#00A3AA]/6 to-[#D65221]/8" />
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-[#0A9ED9]/15 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-[#D65221]/15 rounded-full blur-3xl -z-10" />

      <Card className="w-full max-w-md glass border-white/40 shadow-xl rounded-2xl">
        <CardHeader className="space-y-3 text-center">
          <Link href="/" className="mx-auto">
            <div className="h-11 w-11 rounded-xl brand-gradient flex items-center justify-center text-white font-bold text-xl shadow-md">
              ت
            </div>
          </Link>
          <CardTitle className="text-2xl font-bold">
            <span className={brandGradientText}>نسيت كلمة المرور</span>
          </CardTitle>
          <CardDescription>
            أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center py-6 space-y-4">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>
              <p className="font-semibold">تحقّق من بريدك</p>
              <p className="text-sm text-muted-foreground">
                إذا كان البريد <span className="font-medium" dir="ltr">{email}</span> مسجّلاً،
                ستصلك رسالة برابط إعادة التعيين خلال دقائق.
              </p>
              <Link href="/login">
                <Button variant="outline" className="rounded-xl">
                  <ArrowRight className="h-4 w-4 ml-1" />
                  العودة لتسجيل الدخول
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pr-10 rounded-xl h-11"
                    disabled={pending}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={pending}
                className="w-full h-11 rounded-xl brand-gradient text-white font-semibold hover:opacity-90 transition-opacity shadow-md"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "إرسال رابط إعادة التعيين"}
              </Button>

              <div className="text-center text-sm">
                <Link href="/login" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                  <ArrowRight className="h-3 w-3" />
                  العودة لتسجيل الدخول
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
