import Link from "next/link";
import { ArrowLeft, Play, Sparkles, Camera, Award } from "lucide-react";
import { brandGradientText } from "@/lib/brand";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-bl from-[#0A9ED9]/8 via-[#00A3AA]/5 to-[#D65221]/8" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#0A9ED9]/15 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: "8s" }} />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#D65221]/15 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: "10s" }} />

      <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Text */}
          <div className="text-center lg:text-right space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 border border-white/40 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 text-[#D65221]" />
              منصة تعليم تصوير #1 في جدة
              <span className="h-1.5 w-1.5 rounded-full bg-[#00A3AA] animate-pulse" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              تعلّم التصوير الفوتوغرافي
              <br />
              <span className={brandGradientText}>من الصفر للاحتراف</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              دورات مباشرة مع المدرّب{" "}
              <span className="font-semibold text-foreground">أحمد زغلول</span> —
              أساسيات التصوير، تصوير البيوتي في 12 محاضرة، وميكب توتوريال.
              تعلّم عملي بنقد تفصيلي على صورك وشهادات قابلة للتحقق.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="rounded-xl brand-gradient text-white hover:opacity-90 shadow-lg px-8 h-12"
                >
                  ابدأ رحلتك الآن
                  <ArrowLeft className="h-4 w-4 mr-1" />
                </Button>
              </Link>
              <Link href="/#courses">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-xl h-12 bg-white/60 backdrop-blur-sm"
                >
                  <Play className="h-4 w-4 ml-1" />
                  استكشف الدورات
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Camera className="h-4 w-4 text-[#0A9ED9]" />
                +500 طالب وطالبة
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-[#D65221]" />
                شهادات موثّقة بـ QR
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#00A3AA]" />
                نقد تفصيلي Pin comments
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Decorative gradient rings */}
              <div className="absolute inset-0 rounded-[3rem] brand-gradient opacity-20 blur-2xl" />
              <div className="absolute inset-4 rounded-[2.5rem] brand-gradient opacity-30 blur-xl" />

              {/* Main card */}
              <div className="relative h-full w-full rounded-[2rem] glass border-white/60 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 brand-gradient-soft" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  {/* Camera aperture mock */}
                  <div className="relative w-44 h-44 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-[#0A9ED9]/30" />
                    <div className="absolute inset-2 rounded-full border-4 border-[#00A3AA]/40" />
                    <div className="absolute inset-4 rounded-full border-4 border-[#D65221]/50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-16 w-16 rounded-full brand-gradient flex items-center justify-center shadow-lg">
                        <Camera className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="text-2xl font-bold mb-2">
                    <span className={brandGradientText}>تصويرك</span>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    منصة متكاملة لتعلّم فن التصوير بإشراف مباشر
                  </p>
                </div>
              </div>

              {/* Floating cards */}
              <div className="absolute -top-4 -right-4 glass rounded-2xl border-white/60 p-3 shadow-lg hidden sm:block">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-[#0A9ED9]/15 flex items-center justify-center">
                    <Award className="h-4 w-4 text-[#0A9ED9]" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">شهادات</div>
                    <div className="text-sm font-bold">+200 موثّقة</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 glass rounded-2xl border-white/60 p-3 shadow-lg hidden sm:block">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-[#D65221]/15 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-[#D65221]" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">نقد تفصيلي</div>
                    <div className="text-sm font-bold">Pin على صورك</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
