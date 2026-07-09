import { Star, Quote } from "lucide-react";
import { brandGradientText } from "@/lib/brand";
import { Badge } from "@/components/ui/badge";

interface Testimonial {
  name: string;
  role: string;
  rating: number;
  comment: string;
  accent: "from-[#0A9ED9] to-[#00A3AA]" | "from-[#00A3AA] to-[#D65221]" | "from-[#D65221] to-[#0A9ED9]";
}

const testimonials: Testimonial[] = [
  {
    name: "صفاء",
    role: "طالبة تصوير",
    rating: 5,
    comment:
      "تجربة استثنائية مع تصويرك. تعلمت أساسيات لم أكن أعرفها من قبل، والشرح عملي ومباشر. أنصح كل من يريد دخول عالم التصوير البدء من هنا.",
    accent: "from-[#0A9ED9] to-[#00A3AA]",
  },
  {
    name: "أماني بخش",
    role: "مصورة بيوتي",
    rating: 5,
    comment:
      "دورة تصوير البيوتي غيّرت أسلوبي تماماً. الأستاذ أحمد يشرح تفاصيل دقيقة في الإضاءة والريتوش بطريقة سهلة. صرت أعمل جلسات احترافية بعد الدورة.",
    accent: "from-[#00A3AA] to-[#D65221]",
  },
  {
    name: "المها اليازيدي",
    role: "صانعة محتوى مكياج",
    rating: 5,
    comment:
      "دورة ميكب توتوريال ممتازة جداً. تعلمت كيف أصوّر دروس المكياج باحترافية مع الحفاظ على دقة الألوان. المحتوى غني والتطبيق عملي.",
    accent: "from-[#D65221] to-[#0A9ED9]",
  },
];

export function LandingTestimonials() {
  return (
    <section id="testimonials" className="relative overflow-hidden py-16 lg:py-24">
      <div className="absolute inset-0 -z-10 brand-gradient-soft" />
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge className="bg-[#D65221]/10 text-[#D65221] hover:bg-[#D65221]/15">
            آراء الطلاب
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-extrabold mt-4">
            قصص <span className={brandGradientText}>نجاح حقيقية</span>
          </h2>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            نفخر بكل طالب وطالبة مروا في تصويرك وصنعوا قصصهم الخاصة
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="relative rounded-2xl bg-card border border-border/60 p-6 hover:shadow-lg transition-shadow"
            >
              <Quote className="absolute top-4 left-4 h-8 w-8 text-muted/40" />

              <div className="flex items-center gap-3 mb-4">
                <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${t.accent} flex items-center justify-center text-white font-bold text-lg`}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>

              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#D65221] text-[#D65221]" />
                ))}
              </div>

              <p className="text-sm leading-relaxed text-foreground/90">
                «{t.comment}»
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
