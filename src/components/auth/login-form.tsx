"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";
  const [pending, startTransition] = useTransition();
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        toast.error("بيانات الدخول غير صحيحة");
        return;
      }
      // Fetch session to determine role-based redirect
      const r = await fetch("/api/auth/session").then((x) => x.json());
      const role = r?.user?.role?.toLowerCase() || "student";
      toast.success("تم تسجيل الدخول بنجاح");
      router.push(`/${role}`);
      router.refresh();
    });
  };

  return (
    <Card className="w-full max-w-md glass border-white/40 shadow-xl rounded-2xl">
      <CardHeader className="space-y-3 text-center">
        <CardTitle className="text-3xl font-bold">أهلاً بعودتك</CardTitle>
        <CardDescription className="text-muted-foreground">
          سجّل دخولك للمتابعة في رحلة التعلّم
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              البريد الإلكتروني
            </Label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pr-10 rounded-xl h-11"
                disabled={pending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              كلمة المرور
            </Label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPwd ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pr-10 pl-10 rounded-xl h-11"
                disabled={pending}
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="w-full h-11 rounded-xl brand-gradient text-white font-semibold hover:opacity-90 transition-opacity shadow-md"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "تسجيل الدخول"}
          </Button>

          <div className="text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              نسيت كلمة المرور؟
            </Link>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            ليس لديك حساب؟{" "}
            <Link
              href="/signup"
              className="font-semibold text-foreground hover:underline inline-flex items-center gap-1"
            >
              أنشئ حساباً جديدًا
              <ArrowLeft className="h-3 w-3" />
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
