"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "taswerak_cookie_consent";

export function CookieConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show on client side
    try {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (!consent) {
        // Small delay so it doesn't appear instantly
        const timer = setTimeout(() => setShow(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage might be unavailable (incognito)
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        accepted: true,
        timestamp: new Date().toISOString(),
      }));
    } catch {}
    setShow(false);
  };

  const decline = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        accepted: false,
        timestamp: new Date().toISOString(),
      }));
    } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 z-[100] lg:bottom-6 lg:right-6 lg:left-auto lg:max-w-md">
      <div className="rounded-2xl bg-card border border-border/60 shadow-2xl p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-[#0A9ED9]/10 flex items-center justify-center shrink-0">
            <Cookie className="h-5 w-5 text-[#0A9ED9]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold mb-1">نستخدم ملفات الكوكيز</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              نستخدم الكوكيز لتحسين تجربتك وتحليل أداء الموقع. يمكنك الاطلاع على{" "}
              <Link href="/cookies" className="text-[#0A9ED9] hover:underline">
                سياسة الكوكيز
              </Link>{" "}
              وال{" "}
              <Link href="/privacy" className="text-[#0A9ED9] hover:underline">
                سياسة الخصوصية
              </Link>
              .
            </p>
          </div>
          <button
            onClick={decline}
            className="text-muted-foreground hover:text-foreground shrink-0"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-2 pt-2 border-t border-border/40">
          <Button
            onClick={decline}
            variant="outline"
            size="sm"
            className="rounded-xl flex-1"
          >
            رفض
          </Button>
          <Button
            onClick={accept}
            size="sm"
            className="rounded-xl brand-gradient text-white hover:opacity-90 flex-1"
          >
            قبول الكل
          </Button>
        </div>
      </div>
    </div>
  );
}
