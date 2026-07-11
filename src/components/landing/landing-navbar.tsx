import Link from "next/link";
import { auth } from "@/auth";
import { ArrowLeft, LayoutDashboard } from "lucide-react";
import { brandGradientText, brand } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand/brand-logo";
import { LandingMobileNav } from "./landing-mobile-nav";

const navItems = [
  { href: "/#courses", label: "الدورات" },
  { href: "/about", label: "عن تصويرك" },
  { href: "/#testimonials", label: "آراء الطلاب" },
  { href: "/#instructor", label: "المدرّب" },
  { href: "/contact", label: "تواصل معنا" },
];

export async function LandingNavbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="absolute inset-0 -z-10 glass border-b border-white/40" />
      <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="shrink-0 group">
          <BrandLogo variant="compact" className="group-hover:opacity-90 transition-opacity" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden lg:flex items-center gap-2">
          {session?.user?.role ? (
            <Link href={`/${session.user.role.toLowerCase()}`}>
              <Button
                size="sm"
                className="rounded-xl brand-gradient text-white hover:opacity-90 shadow-sm"
              >
                <LayoutDashboard className="h-4 w-4 ml-1" />
                لوحة التحكم
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="rounded-xl">
                  تسجيل الدخول
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="sm"
                  className="rounded-xl brand-gradient text-white hover:opacity-90 shadow-sm"
                >
                  ابدأ التعلّم
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile */}
        <div className="lg:hidden">
          <LandingMobileNav navItems={navItems} isLoggedIn={!!session?.user?.role} />
        </div>
      </div>
    </header>
  );
}
