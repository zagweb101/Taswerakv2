import Link from "next/link";
import { Camera, Award, Users, Calendar, MapPin } from "lucide-react";
import { brandGradientText } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const highlights = [
  { icon: Camera, title: "+10 سنوات خبرة", desc: "في تصوير البيوتي والبورتريه" },
  { icon: Users, title: "+500 طالب وطالبة", desc: "تخرّجوا من دوراتي" },
  { icon: Award, title: "مدرّب معتمد", desc: "في أكاديميات تصوير محلية" },
  { icon: Calendar, title: "ورش عملية", desc: "في استوديو جدة بشكل دوري" },
];

export function LandingInstructor() {
  return (
    <section id="instructor" className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Visual */}
        <div className="relative order-2 lg:order-1">
          <div className="relative max-w-sm mx-auto">
            <div className="absolute inset-0 rounded-3xl brand-gradient opacity-20 blur-2xl" />
            <div className="relative aspect-[4/5] rounded-3xl bg-card border border-border/60 overflow-hidden shadow-xl">
              <div className="absolute inset-0 brand-gradient-soft" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <div className="h-32 w-32 rounded-full brand-gradient flex items-center justify-center text-5xl font-bold text-white shadow-lg mb-4">
                  أ
                </div>
                <div className="text-2xl font-bold">أحمد زغلول</div>
                <div className="text-sm text-muted-foreground mt-1">
                  مصور محترف ومدرّب تصوير
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-[#D65221]" />
                  جدة، المملكة العربية السعودية
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="order-1 lg:order-2 space-y-5">
          <Badge className="bg-[#00A3AA]/10 text-[#00A3AA] hover:bg-[#00A3AA]/15">
            المدرّب
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight">
            <span className={brandGradientText}>أحمد زغلول</span>
            <br />
            شغف يتحوّل إلى مهنة
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            مصور محترف مقيم في جدة، بدأ رحلته مع التصوير منذ أكثر من عقد.
            تخصّص في تصوير البيوتي والبورتريه، وأسّس منصة تصويرك ليشارك خبرته
            مع الجيل القادم من المصورين السعوديين.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            يؤمن أحمد بأن التصوير فن يُتعلّم بالتطبيق — لذلك كل دوراته تشمل
            نقداً تفصيلياً على أعمال الطلاب مع تعليقات Pin على الصور، وليس
            مجرد محاضرات نظرية.
          </p>

          {/* Highlights grid */}
          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            {highlights.map((h) => (
              <div
                key={h.title}
                className="rounded-xl bg-card border border-border/40 p-3 flex items-start gap-3"
              >
                <div className="h-9 w-9 rounded-lg brand-gradient-soft flex items-center justify-center shrink-0">
                  <h.icon className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <div className="text-sm font-bold">{h.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{h.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 flex flex-wrap gap-3">
            <Link href="/about">
              <Button variant="outline" className="rounded-xl">
                اعرف المزيد
              </Button>
            </Link>
            <Link href="/courses">
              <Button className="rounded-xl brand-gradient text-white hover:opacity-90">
                استكشف دوراته
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
