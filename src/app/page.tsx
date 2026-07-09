import Link from "next/link";
import { auth } from "@/auth";
import { ArrowLeft, BookOpen, Award, Wallet, ShieldCheck } from "lucide-react";
import { brandGradientText } from "@/lib/brand";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();

  // If logged in, redirect to their dashboard
  if (session?.user?.role) {
    const role = session.user.role.toLowerCase();
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">سيتم تحويلك للوحة التحكم…</p>
          <Link href={`/${role}`}>
            <Button className="rounded-xl brand-gradient text-white">
              اذهب الآن <ArrowLeft className="h-4 w-4 mr-1 inline" />
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  // Public placeholder landing (full landing = Phase 3)
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-bl from-[#0A9ED9]/8 via-[#00A3AA]/5 to-[#D65221]/8" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0A9ED9]/15 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#D65221]/15 rounded-full blur-3xl -z-10" />

      {/* Top nav */}
      <header className="container mx-auto px-4 lg:px-8 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl brand-gradient flex items-center justify-center text-white font-bold text-lg shadow-md">
            ت
          </div>
          <span className={`text-2xl font-extrabold ${brandGradientText}`}>
            تصويرك
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" className="rounded-xl">
              تسجيل الدخول
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="rounded-xl brand-gradient text-white hover:opacity-90">
              ابدأ التعلّم
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero (placeholder) */}
      <section className="container mx-auto px-4 lg:px-8 py-16 lg:py-24 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 border border-white/40 text-xs font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00A3AA] animate-pulse" />
            جدة · السعودية · 2026
          </div>
          <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight">
            تعلّم التصوير الفوتوغرافي
            <br />
            <span className={brandGradientText}>من الصفر للاحتراف</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            منصة تعليمية متخصصة في تعليم التصوير الفوتوغرافي مع المدرّب{" "}
            <span className="font-semibold text-foreground">أحمد زغلول</span>.
            دورات في أساسيات التصوير، تصوير البيوتي، وميكب توتوريال.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link href="/signup">
              <Button size="lg" className="rounded-xl brand-gradient text-white hover:opacity-90 shadow-lg px-8">
                ابدأ رحلتك الآن
                <ArrowLeft className="h-4 w-4 mr-1" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="rounded-xl">
                لديّ حساب
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features (preview) */}
      <section className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Feature icon={<BookOpen className="h-5 w-5" />} title="دورات متكاملة" desc="أساسيات، بيوتي 12 محاضرة، ميكب توتوريال" tint="text-[#0A9ED9] bg-[#0A9ED9]/10" />
          <Feature icon={<Wallet className="h-5 w-5" />} title="دفع يدوي" desc="إيصال تحويل بنكي يُعتمد من المدرّب" tint="text-[#00A3AA] bg-[#00A3AA]/10" />
          <Feature icon={<Award className="h-5 w-5" />} title="شهادات QR" desc="شهادة قابلة للتحقق عند إتمام الدورة" tint="text-[#D65221] bg-[#D65221]/10" />
          <Feature icon={<ShieldCheck className="h-5 w-5" />} title="نقد تفصيلي" desc="تعليقات Pin على صورك من المدرّب" tint="text-purple-600 bg-purple-100" />
        </div>
      </section>

      {/* Phase 3 banner */}
      <section className="container mx-auto px-4 lg:px-8 py-8">
        <div className="rounded-2xl glass border-white/40 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            🚀 الصفحة الرئيسية الكاملة قيد التطوير (المرحلة 3) — صفحات تسجيل الدخول والوحات جاهزة الآن
          </p>
        </div>
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  desc,
  tint,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  tint: string;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border/40 p-5 hover:shadow-md transition-shadow">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${tint} mb-3`}>
        {icon}
      </div>
      <div className="font-semibold mb-1">{title}</div>
      <div className="text-xs text-muted-foreground">{desc}</div>
    </div>
  );
}
