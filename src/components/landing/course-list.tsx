"use client";

import Link from "next/link";
import { ArrowLeft, Clock, BarChart3, Play, Search } from "lucide-react";
import { useState } from "react";
import { brandGradientText } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Course {
  slug: string;
  titleAr: string | null;
  title: string;
  descriptionAr: string | null;
  description: string;
  price: any;
  durationHours: number;
  level: string;
  category: string | null;
}

// Fallback static list — used when DB is empty (e.g., before seeding)
const fallbackCourses: Course[] = [
  {
    slug: "photography-fundamentals",
    titleAr: "أساسيات التصوير",
    title: "Photography Fundamentals",
    descriptionAr:
      "ابدأ من هنا — تعرّف على تشريح الكاميرا، مثلث التعريض، قواعد التكوين، وأساسيات الإضاءة. رحلة كاملة من الوضع التلقائي إلى اليدوي.",
    description: "",
    price: 499,
    durationHours: 12,
    level: "BEGINNER",
    category: "أساسيات",
  },
  {
    slug: "beauty-photography-12-lectures",
    titleAr: "تصوير البيوتي Beauty",
    title: "Beauty Photography (12 Lectures)",
    descriptionAr:
      "12 محاضرة متعمقة في تصوير البيوتي: تجهيز الاستوديو، التعاون مع خبيرة المكياج، إضاءة البشرة، سير عمل الريتوش، وبناء معرض أعمال احترافي.",
    description: "",
    price: 899,
    durationHours: 24,
    level: "INTERMEDIATE",
    category: "بيوتي",
  },
  {
    slug: "makeup-tutorial-photography",
    titleAr: "ميكب توتوريال",
    title: "Makeup Tutorial Photography",
    descriptionAr:
      "تخصّص في تصوير دروس المكياج — العمل بعدسة الماكرو، ضمان دقة الألوان، الالتقاط خطوة بخطوة، وإنتاج محتوى توتوريال جذّاب لمنصات التواصل.",
    description: "",
    price: 599,
    durationHours: 16,
    level: "INTERMEDIATE",
    category: "مكياج",
  },
];

const accents = [
  "from-[#0A9ED9] to-[#00A3AA]",
  "from-[#00A3AA] to-[#D65221]",
  "from-[#D65221] to-[#0A9ED9]",
];

const levelLabels: Record<string, { label: string; cls: string }> = {
  BEGINNER: { label: "مبتدئ", cls: "bg-emerald-100 text-emerald-700" },
  INTERMEDIATE: { label: "متوسط", cls: "bg-amber-100 text-amber-700" },
  ADVANCED: { label: "متقدّم", cls: "bg-rose-100 text-rose-700" },
  PROFESSIONAL: { label: "احترافي", cls: "bg-purple-100 text-purple-700" },
};

export function CourseList({ courses }: { courses: Course[] }) {
  const [q, setQ] = useState("");
  const list = courses.length > 0 ? courses : fallbackCourses;
  const filtered = q
    ? list.filter((c) =>
        (c.titleAr || c.title).toLowerCase().includes(q.toLowerCase()) ||
        (c.category || "").includes(q)
      )
    : list;

  return (
    <div className="space-y-8">
      {/* Search */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث في الدورات..."
          className="pr-10 rounded-xl"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">لا توجد دورات مطابقة لبحثك.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course, idx) => {
            const level = levelLabels[course.level] || { label: course.level, cls: "bg-muted" };
            return (
              <div
                key={course.slug}
                className="group rounded-2xl bg-card border border-border/60 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`relative h-48 bg-gradient-to-br ${accents[idx % accents.length]} overflow-hidden`}>
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
                      {course.category || "عام"}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <Badge className={`${level.cls} hover:opacity-90`}>{level.label}</Badge>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="text-xl font-bold leading-snug">
                    {course.titleAr || course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {course.descriptionAr || course.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {course.durationHours} ساعة
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/40 mt-3">
                    <div>
                      <span className="text-2xl font-extrabold brand-gradient-text">
                        {Number(course.price).toLocaleString("ar-SA")}
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
      )}
    </div>
  );
}
