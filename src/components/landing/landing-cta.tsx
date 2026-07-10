import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { brandGradientText } from "@/lib/brand";
import { Button } from "@/components/ui/button";

export function LandingCTA() {
  return (
    <section className="container mx-auto px-4 lg:px-8 py-16 lg:py-20">
      <div className="relative rounded-3xl overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 brand-gradient" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-black/30" />

        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 border-8 border-white rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 border-8 border-white rounded-full translate-y-32 -translate-x-32" />
        </div>

        <div className="relative px-6 py-12 lg:px-12 lg:py-16 text-center text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            ابدأ اليوم
          </div>
          <h2 className="text-3xl lg:text-5xl font-extrabold leading-tight max-w-2xl mx-auto">
            رحلتك في التصوير
            <br />
            تبدأ بخطوة واحدة
          </h2>
          <p className="text-white/85 mt-4 max-w-xl mx-auto leading-relaxed">
            انضم لمئات الطلاب الذين حوّلوا شغفهم بالتصوير إلى مهارة احترافية.
            سجّل الآن واحصل على نقد تفصيلي على أول أعمالك.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-white text-foreground hover:bg-white/90 rounded-xl shadow-lg h-12 px-8"
              >
                أنشئ حسابك مجاناً
                <ArrowLeft className="h-4 w-4 mr-1" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10 hover:text-white rounded-xl h-12"
              >
                تواصل معنا
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
