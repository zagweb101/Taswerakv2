import Link from "next/link";
import { ArrowLeft, Clock, BarChart3, Play } from "lucide-react";
import { brandGradientText } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CourseCard {
  slug: string;
  titleAr: string;
  descriptionAr: string;
  price: number;
  durationHours: number;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  category: string;
  lectures: number;
  accent: "from-[#0A9ED9] to-[#00A3AA]" | "from-[#00A3AA] to-[#D65221]" | "from-[#D65221] to-[#0A9ED9]";
}

const courses: CourseCard[] = [
  {
    slug: "photography-fundamentals",
    titleAr: "أساسيات التصوير",
    descriptionAr:
      "ابدأ من هنا — تعرّف على تشريح الكاميرا، مثلث التعريض، قواعد التكوين، وأساسيات الإضاءة. رحلة كاملة من الوضع التلقائي إلى اليدوي.",
    price: 499,
    durationHours: 12,
    level: "BEGINNER",
    category: "أساسيات",
    lectures: 18,
    accent: "from-[#0A9ED9] to-[#00A3AA]",
  },
  {
    slug: "beauty-photography-12-lectures",
    titleAr: "تصوير البيوتي Beauty",
    descriptionAr:
      "12 محاضرة متعمقة في تصوير البيوتي: تجهيز الاستوديو، التعاون مع خبيرة المكياج، إضاءة البشرة، سير عمل الريتوش، وبناء معرض أعمال احترافي.",
    price: 899,
    durationHours: 24,
    level: "INTERMEDIATE",
    category: "بيوتي",
    lectures: 12,
    accent: "from-[#00A3AA] to-[#D65221]",
  },
  {
    slug: "makeup-tutorial-photography",
    titleAr: "ميكب توتوريال",
    descriptionAr:
      "تخصّص في تصوير دروس المكياج — العمل بعدسة الماكرو، ضمان دقة الألوان، الالتقاط خطوة بخطوة، وإنتاج محتوى توتوريال جذّاب لمنصات التواصل.",
    price: 599,
    durationHours: 16,
    level: "INTERMEDIATE",
    category: "مكياج",
    lectures: 14,
    accent: "from-[#D65221] to-[#0A9ED9]",
  },
];

const levelLabels: Record<CourseCard["level"], { label: string; cls: string }> = {
  BEGINNER: { label: "مبتدئ", cls: "bg-emerald-100 text-emerald-700" },
  INTERMEDIATE: { label: "متوسط", cls: "bg-amber-100 text-amber-700" },
  ADVANCED: { label: "متقدّم", cls: "bg-rose-100 text-rose-700" },
};

export function LandingCourses() {
  return (
    <section id="courses" className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <Badge className="bg-[#0A9ED9]/10 text-[#0A9ED9] hover:bg-[#0A9ED9]/15">
          دوراتنا
        </Badge>
        <h2 className="text-3xl lg:text-4xl font-extrabold mt-4">
          تعلّم من <span className={brandGradientText}>خبرة عملية</span>
        </h2>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          كل دورة مصمّمة بعناية — محاضرات واضحة، تطبيق عملي، ونقد تفصيلي على أعمالك.
          ابدأ من الأساسيات وتدرّج حتى الاحتراف.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const level = levelLabels[course.level];
          return (
            <div
              key={course.slug}
              className="group rounded-2xl bg-card border border-border/60 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Thumbnail */}
              <div className={`relative h-48 bg-gradient-to-br ${course.accent} overflow-hidden`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 rounded-full bg-white/30 backdrop-blur-sm" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="h-10 w-10 text-white fill-white" />
                    </div>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="bg-white/80 backdrop-blur-sm text-foreground text-xs px-2.5 py-1 rounded-full font-medium">
                    {course.category}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3">
                  <Badge className={`${level.cls} hover:opacity-90`}>
                    {level.label}
                  </Badge>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3">
                <h3 className="text-xl font-bold leading-snug">
                  {course.titleAr}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {course.descriptionAr}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {course.durationHours} ساعة
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="h-3.5 w-3.5" />
                    {course.lectures} محاضرة
                  </span>
                </div>

                {/* Price + CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-border/40 mt-3">
                  <div>
                    <span className="text-2xl font-extrabold brand-gradient-text">
                      {course.price.toLocaleString("ar-SA")}
                    </span>
                    <span className="text-sm text-muted-foreground mr-1">ر.س</span>
                  </div>
                  <Link href={`/courses/${course.slug}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl group-hover:brand-gradient group-hover:text-white group-hover:border-transparent transition-all"
                    >
                      التفاصيل
                      <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-10">
        <Link href="/courses">
          <Button variant="outline" className="rounded-xl h-11 px-6">
            عرض كل الدورات
            <ArrowLeft className="h-4 w-4 mr-1" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
