"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { brandGradientText } from "@/lib/brand";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-bl from-red-50 via-amber-50 to-red-50" />
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-red-200/40 rounded-full blur-3xl -z-10" />

      <div className="text-center max-w-md mx-auto space-y-6">
        <div className="relative mx-auto h-32 w-32">
          <div className="absolute inset-0 rounded-full bg-red-200 opacity-40 blur-2xl" />
          <div className="relative h-full w-full rounded-3xl bg-white border border-red-200 shadow-2xl flex flex-col items-center justify-center">
            <AlertTriangle className="h-12 w-12 text-amber-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold">
            حدث <span className="text-red-600">خطأ غير متوقع</span>
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            نعتذر عن هذا الإزعاج. حاول مرة أخرى، أو عُد للصفحة الرئيسية.
            إذا تكرر الخطأ، تواصل مع الدعم.
          </p>
          {error?.digest && (
            <p className="text-xs text-muted-foreground/60 mt-2 font-mono" dir="ltr">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            onClick={reset}
            className="rounded-xl brand-gradient text-white hover:opacity-90 h-11 px-6"
          >
            <RefreshCw className="h-4 w-4 ml-1" />
            إعادة المحاولة
          </Button>
          <Link href="/">
            <Button variant="outline" className="rounded-xl h-11">
              <Home className="h-4 w-4 ml-1" />
              الرئيسية
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
