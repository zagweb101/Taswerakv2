"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { brandGradientText } from "@/lib/brand";

interface Item {
  href: string;
  label: string;
}

export function LandingMobileNav({
  navItems,
  isLoggedIn,
}: {
  navItems: Item[];
  isLoggedIn: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg hover:bg-muted/60"
        aria-label="القائمة"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute top-0 right-0 h-full w-72 max-w-[85%] bg-card shadow-2xl flex flex-col">
            <div className="h-16 px-4 flex items-center justify-between border-b border-border/60">
              <span className={`text-lg font-bold ${brandGradientText}`}>
                تصويرك
              </span>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-muted"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="p-3 border-t border-border/60 space-y-2">
              {isLoggedIn ? (
                <Link href="/student" onClick={() => setOpen(false)}>
                  <Button className="w-full rounded-xl brand-gradient text-white">
                    لوحة التحكم
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full rounded-xl">
                      تسجيل الدخول
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setOpen(false)}>
                    <Button className="w-full rounded-xl brand-gradient text-white">
                      ابدأ التعلّم
                      <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
