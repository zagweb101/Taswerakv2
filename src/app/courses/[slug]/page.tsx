import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  BarChart3,
  Play,
  CheckCircle2,
  Award,
  Camera,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { brandGradientText } from "@/lib/brand";

export const dynamic = "force-dynamic";

const fallbackCourses: Record<
  string,
  {
    slug: string;
    titleAr: string;
    title: string;
    descriptionAr: string;
    description: string;
    price: number;
    durationHours: number;
    level: string;
    category: string;
    lectures: number;
    whatYouLearn: string[];
    curriculum: { title: string; lectures: number }[];
  }
> = {
  "photography-fundamentals": {
    slug: "photography-fundamentals",
    titleAr: "أساسيات التصوير",
    title: "Photography Fundamentals",
    descriptionAr:
      "ابدأ من هنا — تعرّف على تشريح الكاميرا، مثلث التعريض، قواعد التكوين، وأساسيات الإضاءة. رحلة كاملة من الوضع التلقائي إلى اليدوي. الدورة مناسبة للمبتدئين تماماً ولا تتطلب أي خبرة سابقة.",
    description: "",
    price: 499,
    durationHours: 12,
    level: "BEGINNER",
    category: "أساسيات",
    lectures: 18,
    whatYouLearn: [
      "تشريح الكاميرا وأنواعها (DSLR، Mirrorless، الهاتف)",
      "مثلث التعريض: ISO، سرعة الغالق، فتحة العدسة",
      "قواعد التكوين: قاعدة الأثلاث، الإطار، الخطوط الموجهة",
      "أنواع العدلات واستخدام كل منها",
      "أساسيات الإضاءة الطبيعية والصناعية",
      "الانتقال للوضع اليدوي بثقة",
      "معالجة الصور الأساسية (Lightroom مقدمة)",
      "بناء معرض أعمال أولي",
    ],
    curriculum: [
      { title: "الوحدة 1: مدخل للتصوير", lectures: 4 },
      { title: "الوحدة 2: تشريح الكاميرا", lectures: 3 },
      { title: "الوحدة 3: مثلث التعريض", lectures: 4 },
      { title: "الوحدة 4: التكوين والإطار", lectures: 3 },
      { title: "الوحدة 5: الإضاءة", lectures: 2 },
      { title: "الوحدة 6: ما بعد التصوير", lectures: 2 },
    ],
  },
  "beauty-photography-12-lectures": {
    slug: "beauty-photography-12-lectures",
    titleAr: "تصوير البيوتي Beauty",
    title: "Beauty Photography (12 Lectures)",
    descriptionAr:
      "12 محاضرة متعمقة في تصوير البيوتي: تجهيز الاستوديو، التعاون مع خبيرة المكياج، إضاءة البشرة، سير عمل الريتوش، وبناء معرض أعمال احترافي. الدورة تتطلب معرفة أساسية بالكاميرا.",
    description: "",
    price: 899,
    durationHours: 24,
    level: "INTERMEDIATE",
    category: "بيوتي",
    lectures: 12,
    whatYouLearn: [
      "تجهيز استوديو البيوتي (الإضاءة، الخلفيات، العدسات)",
      "التواصل والتعاون مع خبيرة المكياج",
      "إضاءة البشرة: رمبرانت، الفراشة، الحلقة",
      "اختيار الزاوية الصحيحة لكل وجه",
      "إدارة الجلسة وتوجيه الموديل",
      "ريتوش البشرة باحترافية (تكرار التردد، التردد المنفصل)",
      "تناسق الألوان والمزاج البصري",
      "بناء معرض أعمال يلفت الوكلاء والعملاء",
    ],
    curriculum: [
      { title: "المحاضرة 1: مدخل لتصوير البيوتي", lectures: 1 },
      { title: "المحاضرة 2: تجهيز الاستوديو", lectures: 1 },
      { title: "المحاضرة 3-4: الإضاءة والتجهيز", lectures: 2 },
      { title: "المحاضرة 5-6: العمل مع الموديل", lectures: 2 },
      { title: "المحاضرة 7-9: تطبيق عملي", lectures: 3 },
      { title: "المحاضرة 10-11: الريتوش المتقدم", lectures: 2 },
      { title: "المحاضرة 12: بناء معرض الأعمال", lectures: 1 },
    ],
  },
  "makeup-tutorial-photography": {
    slug: "makeup-tutorial-photography",
    titleAr: "ميكب توتوريال",
    title: "Makeup Tutorial Photography",
    descriptionAr:
      "تخصّص في تصوير دروس المكياج — العمل بعدسة الماكرو، ضمان دقة الألوان، الالتقاط خطوة بخطوة، وإنتاج محتوى توتوريال جذّاب لمنصات التواصل. الدورة مثالية لصانعات المحتوى وخبيرات المكياج.",
    description: "",
    price: 599,
    durationHours: 16,
    level: "INTERMEDIATE",
    category: "مكياج",
    lectures: 14,
    whatYouLearn: [
      "اختيار العدسة المناسبة للماكرو",
      "ضبط توازن اللون الأبيض لدقة الألوان",
      "إضاءة ثابتة لتصوير الخطوات",
      "تصوير المنتجات (باليتات، فرش، أحمر الشفاه)",
      "تكوين الكادر لكل خطوة مكياج",
      "تصوير before/after باحترافية",
      "المونتاج السريع لمحتوى السوشيال",
      "بناء محتوى توتوريال قابل لإعادة الاستخدام",
    ],
    curriculum: [
      { title: "الوحدة 1: عدسات الماكرو", lectures: 3 },
      { title: "الوحدة 2: دقة الألوان", lectures: 2 },
      { title: "الوحدة 3: الإضاءة الثابتة", lectures: 3 },
      { title: "الوحدة 4: تصوير المنتجات", lectures: 2 },
      { title: "الوحدة 5: تصوير الخطوات", lectures: 2 },
      { title: "الوحدة 6: المونتاج والمحتوى", lectures: 2 },
    ],
  },
};

const levelLabels: Record<string, { label: string; cls: string }> = {
  BEGINNER: { label: "مبتدئ", cls: "bg-emerald-100 text-emerald-700" },
  INTERMEDIATE: { label: "متوسط", cls: "bg-amber-100 text-amber-700" },
  ADVANCED: { label: "متقدّم", cls: "bg-rose-100 text-rose-700" },
  PROFESSIONAL: { label: "احترافي", cls: "bg-purple-100 text-purple-700" },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = fallbackCourses[slug];
  return {
    title: course ? `${course.titleAr} | تصويرك` : "دورة | تصويرك",
    description: course?.descriptionAr || "تفاصيل دورة تصويرك",
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Check auth state for enrollment CTA
  const session = await auth();
  let existingEnrollment: any = null;

  // Try DB first
  let dbCourse: any = null;
  try {
    dbCourse = await db.course.findUnique({
      where: { slug },
      include: {
        sections: {
          orderBy: { order: "asc" },
          include: {
            lessons: { orderBy: { order: "asc" }, select: { id: true, title: true, duration: true, isPreview: true } },
          },
        },
        instructor: { select: { id: true, name: true, bio: true } },
      },
    });
  } catch {
    // DB unavailable — use fallback
  }

  const fallback = fallbackCourses[slug];

  if (!dbCourse && !fallback) {
    notFound();
  }

  // Check existing enrollment if student is logged in
  if (session?.user?.id && session.user.role === "STUDENT" && dbCourse) {
    try {
      existingEnrollment = await db.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: session.user.id,
            courseId: dbCourse.id,
          },
        },
        select: { id: true, status: true, progress: true },
      });
    } catch {
      // ignore
    }
  }

  // Determine CTA based on auth + enrollment state
  const enrollmentCta = (() => {
    if (!session?.user) {
      return {
        href: "/signup",
        label: "سجّل في الدورة",
        variant: "default" as const,
      };
    }
    if (session.user.role !== "STUDENT") {
      return {
        href: `/${session.user.role.toLowerCase()}`,
        label: "العودة للوحة التحكم",
        variant: "outline" as const,
      };
    }
    if (existingEnrollment?.status === "ACTIVE") {
      // Find first lesson
      const firstSection = dbCourse?.sections?.[0];
      const firstLesson = firstSection?.lessons?.[0];
      return {
        href: firstLesson
          ? `/student/learn/${dbCourse.id}/${firstLesson.id}`
          : "/student/courses",
        label: "متابعة الدورة",
        variant: "default" as const,
      };
    }
    if (existingEnrollment?.status === "PENDING_APPROVAL") {
      return {
        href: "/student/payments",
        label: "بانتظار اعتماد الدفعة",
        variant: "outline" as const,
      };
    }
    if (existingEnrollment?.status === "PENDING_PAYMENT") {
      return {
        href: "/student/payments",
        label: "ارفع إيصال الدفع",
        variant: "default" as const,
      };
    }
    // Logged-in student, not enrolled — go to payments to upload receipt
    return {
      href: `/student/payments?course=${dbCourse?.id || ""}`,
      label: "ارفع إيصال الدفع",
      variant: "default" as const,
    };
  })();

  const level = dbCourse?.level || fallback?.level || "BEGINNER";
  const levelInfo = levelLabels[level] || { label: level, cls: "bg-muted" };

  const titleAr = dbCourse?.titleAr || fallback?.titleAr || "دورة";
  const descriptionAr = dbCourse?.descriptionAr || fallback?.descriptionAr || "";
  const price = Number(dbCourse?.price || fallback?.price || 0);
  const durationHours = dbCourse?.durationHours || fallback?.durationHours || 0;
  const category = dbCourse?.category || fallback?.category || "عام";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LandingNavbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 -z-10 brand-gradient-soft" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#0A9ED9]/15 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D65221]/15 rounded-full blur-3xl -z-10" />

          <div className="container mx-auto px-4 lg:px-8 py-10 lg:py-16">
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-start">
              {/* Main info */}
              <div className="lg:col-span-2 space-y-5">
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  العودة للدورات
                </Link>

                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-[#0A9ED9]/10 text-[#0A9ED9] hover:bg-[#0A9ED9]/15">
                    {category}
                  </Badge>
                  <Badge className={`${levelInfo.cls} hover:opacity-90`}>
                    {levelInfo.label}
                  </Badge>
                </div>

                <h1 className={`text-3xl lg:text-5xl font-extrabold ${brandGradientText}`}>
                  {titleAr}
                </h1>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  {descriptionAr}
                </p>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-[#0A9ED9]" />
                    <span className="text-muted-foreground">المدة:</span>
                    <span className="font-semibold">{durationHours} ساعة</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 text-[#00A3AA]" />
                    <span className="text-muted-foreground">المستوى:</span>
                    <span className="font-semibold">{levelInfo.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Camera className="h-4 w-4 text-[#D65221]" />
                    <span className="text-muted-foreground">المدرّب:</span>
                    <span className="font-semibold">أحمد زغلول</span>
                  </div>
                </div>
              </div>

              {/* Enrollment card */}
              <aside className="lg:sticky lg:top-20">
                <div className="rounded-2xl bg-card border border-border/60 overflow-hidden shadow-lg">
                  <div className="aspect-video brand-gradient flex items-center justify-center">
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 rounded-full bg-white/30 backdrop-blur-sm" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="h-8 w-8 text-white fill-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <div>
                      <span className="text-4xl font-extrabold brand-gradient-text">
                        {price.toLocaleString("ar-SA")}
                      </span>
                      <span className="text-base text-muted-foreground mr-1.5">ر.س</span>
                    </div>

                    <Link href={enrollmentCta.href}>
                      <Button
                        className={`w-full rounded-xl h-12 text-base ${
                          enrollmentCta.variant === "default"
                            ? "brand-gradient text-white hover:opacity-90"
                            : ""
                        }`}
                        variant={enrollmentCta.variant}
                      >
                        {enrollmentCta.label}
                        <ArrowLeft className="h-4 w-4 mr-1" />
                      </Button>
                    </Link>

                    <div className="space-y-2 pt-2 border-t border-border/40">
                      <Feature icon={<ShieldCheck className="h-4 w-4 text-[#0A9ED9]" />} text="دفع يدوي عبر تحويل بنكي" />
                      <Feature icon={<Sparkles className="h-4 w-4 text-[#00A3AA]" />} text="نقد تفصيلي على أعمالك" />
                      <Feature icon={<Award className="h-4 w-4 text-[#D65221]" />} text="شهادة موثّقة بـ QR" />
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* What you'll learn */}
        {fallback && (
          <section className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
            <div className="grid lg:grid-cols-2 gap-10">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold mb-5">
                  ماذا ستتعلّم؟
                </h2>
                <ul className="space-y-3">
                  {fallback.whatYouLearn.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-5 w-5 text-[#00A3AA] shrink-0 mt-0.5" />
                      <span className="text-foreground/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-2xl lg:text-3xl font-bold mb-5">
                  منهج الدورة
                </h2>
                <div className="space-y-2">
                  {fallback.curriculum.map((unit, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg brand-gradient-soft flex items-center justify-center text-sm font-bold">
                          {(i + 1).toLocaleString("ar-SA")}
                        </div>
                        <span className="font-medium">{unit.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {unit.lectures.toLocaleString("ar-SA")} محاضرة
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="container mx-auto px-4 lg:px-8 pb-16">
          <div className="rounded-2xl brand-gradient-soft border border-border/60 p-8 text-center">
            <h2 className="text-2xl font-bold mb-3">جاهز تبدأ؟</h2>
            <p className="text-muted-foreground mb-5">
              انضم اليوم وابدأ رحلتك في تصوير البيوتي والبورتريه مع نقد تفصيلي على أعمالك.
            </p>
            <Link href={enrollmentCta.href}>
              <Button
                className={`rounded-xl h-12 px-8 ${
                  enrollmentCta.variant === "default"
                    ? "brand-gradient text-white hover:opacity-90"
                    : ""
                }`}
                variant={enrollmentCta.variant}
              >
                {enrollmentCta.label}
                <ArrowLeft className="h-4 w-4 mr-1" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {icon}
      <span>{text}</span>
    </div>
  );
}
