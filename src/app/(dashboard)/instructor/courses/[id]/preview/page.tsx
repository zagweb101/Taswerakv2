import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, Clock, BookOpen, Play, Lock, Award, ShieldCheck, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { brandGradientText } from "@/lib/brand";
import { DashboardPageHeader } from "@/components/dashboard/page-header";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

const levelLabels: Record<string, string> = {
  BEGINNER: "مبتدئ",
  INTERMEDIATE: "متوسط",
  ADVANCED: "متقدّم",
  PROFESSIONAL: "احترافي",
};

const statusLabels: Record<string, { label: string; cls: string }> = {
  DRAFT: { label: "مسودة", cls: "bg-zinc-100 text-zinc-700" },
  PUBLISHED: { label: "منشور", cls: "bg-emerald-100 text-emerald-700" },
  UNLISTED: { label: "غير مُدرج", cls: "bg-amber-100 text-amber-700" },
  ARCHIVED: { label: "مؤرشف", cls: "bg-red-100 text-red-700" },
};

export default async function CoursePreviewPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
    redirect(`/${session.user.role.toLowerCase()}`);
  }

  const { id } = await params;

  let course: any = null;
  try {
    course = await db.course.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { order: "asc" },
          include: {
            lessons: { orderBy: { order: "asc" } },
          },
        },
        instructor: { select: { id: true, name: true } },
        _count: { select: { enrollments: true } },
      },
    });
  } catch (err) {
    console.error("[course preview] DB error:", err);
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">تعذّر تحميل الدورة.</p>
        <Link href="/instructor/courses" className="mt-4 inline-block">
          <Button variant="outline">العودة للدورات</Button>
        </Link>
      </div>
    );
  }

  if (!course) notFound();

  // Authorization: instructor must own the course (admin can view any)
  if (session.user.role === "INSTRUCTOR" && course.instructorId !== session.user.id) {
    redirect("/instructor/courses");
  }

  const status = statusLabels[course.status] || statusLabels.DRAFT;
  const isDraft = course.status === "DRAFT";
  const isUnlisted = course.status === "UNLISTED";
  const totalLessons = course.sections.reduce((sum: number, s: any) => sum + s.lessons.length, 0);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/instructor/courses" className="hover:text-foreground">دوراتي</Link>
        <span>/</span>
        <Link href={`/instructor/courses/${course.id}/edit`} className="hover:text-foreground">تحرير</Link>
        <span>/</span>
        <span className="text-foreground font-medium">معاينة</span>
      </div>

      {/* Draft warning banner */}
      {(isDraft || isUnlisted) && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <div className="font-semibold text-amber-800 text-sm">
              {isDraft ? "معاينة خاصة — هذه الدورة مسودة غير منشورة للطلاب" : "معاينة خاصة — هذه الدورة غير مُدرجة علناً"}
            </div>
            <div className="text-xs text-amber-700 mt-0.5">
              هذه الصفحة مرئية لك فقط. الطلاب لا يستطيعون رؤيتها حتى النشر.
            </div>
          </div>
        </div>
      )}

      {/* Course header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className={`text-2xl lg:text-3xl font-extrabold ${brandGradientText}`}>
            {course.titleAr || course.title}
          </h1>
          <Badge className={status.cls}>{status.label}</Badge>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          {course.descriptionAr || course.description}
        </p>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {course.durationHours} ساعة
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {totalLessons} درس
          </span>
          <span>المستوى: {levelLabels[course.level] || course.level}</span>
          <span>السعر: {Number(course.price).toLocaleString("ar-SA")} {course.currency}</span>
          <span>الطلاب: {course._count.enrollments}</span>
        </div>
      </div>

      {/* Sections + Lessons */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold">محتوى الدورة</h2>
        {course.sections.length === 0 ? (
          <Card className="rounded-2xl border-border/60">
            <CardContent className="p-8 text-center text-muted-foreground">
              لا توجد أقسام في هذه الدورة بعد
            </CardContent>
          </Card>
        ) : (
          course.sections.map((section: any, sIdx: number) => (
            <Card key={section.id} className="rounded-2xl border-border/60 overflow-hidden">
              <div className="bg-muted/30 p-3 flex items-center gap-3">
                <div className="h-7 w-7 rounded-lg brand-gradient text-white text-xs font-bold flex items-center justify-center">
                  {(sIdx + 1).toLocaleString("ar-SA")}
                </div>
                <span className="font-semibold">{section.title}</span>
                <span className="text-xs text-muted-foreground">{section.lessons.length} درس</span>
              </div>
              <div className="divide-y divide-border/40">
                {section.lessons.map((lesson: any, lIdx: number) => (
                  <div key={lesson.id} className="p-3 flex items-center gap-3">
                    <div className="h-7 w-7 rounded-lg bg-muted text-muted-foreground text-xs font-medium flex items-center justify-center">
                      {(lIdx + 1).toLocaleString("ar-SA")}
                    </div>
                    {lesson.videoUrl ? (
                      <Play className="h-4 w-4 text-[#0A9ED9]" />
                    ) : lesson.pdfUrl ? (
                      <FileText className="h-4 w-4 text-[#D65221]" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{lesson.title}</div>
                      {lesson.videoUrl && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {Math.floor(lesson.duration / 60)}د {lesson.duration % 60}ث
                          {lesson.isPreview && <span className="text-[#00A3AA] mr-2">· معاينة مجانية</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link href={`/instructor/courses/${course.id}/edit`}>
          <Button variant="outline" className="rounded-xl">
            <ArrowRight className="h-4 w-4 ml-1" />
            العودة للتحرير
          </Button>
        </Link>
        {course.status === "PUBLISHED" && (
          <Link href={`/courses/${course.slug}`} target="_blank">
            <Button variant="outline" className="rounded-xl">
              <Eye className="h-4 w-4 ml-1" />
              عرض الصفحة العامة
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
