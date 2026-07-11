import { auth } from "@/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft, CheckCircle2, Clock, Lock, Play, FileText, BookOpen } from "lucide-react";
import { brandGradientText } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressRing } from "@/components/dashboard/status-badges";
import { LessonVideoPlayer } from "@/components/student/lesson-video-player";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default async function LessonPlayerPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "STUDENT") {
    redirect(`/${session.user.role.toLowerCase()}`);
  }

  const { courseId, lessonId } = await params;

  // Verify enrollment is ACTIVE
  let enrollment: any = null;
  let course: any = null;
  let lesson: any = null;
  let sections: any[] = [];
  let assignments: any[] = [];

  try {
    enrollment = await db.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId: session.user.id, courseId },
      },
      include: {
        course: {
          include: {
            sections: {
              orderBy: { order: "asc" },
              include: {
                lessons: { orderBy: { order: "asc" } },
              },
            },
            instructor: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!enrollment || enrollment.status !== "ACTIVE") {
      redirect("/student/courses");
    }

    course = enrollment.course;
    sections = course.sections;

    // Find current lesson
    for (const section of sections) {
      const found = section.lessons.find((l: any) => l.id === lessonId);
      if (found) {
        lesson = found;
        break;
      }
    }

    if (!lesson) notFound();

    // Get assignments for this lesson
    assignments = await db.assignment.findMany({
      where: { lessonId: lesson.id, isPublished: true },
      orderBy: { order: "asc" },
    });

    // Get user's submissions for these assignments
    if (assignments.length > 0) {
      const submissions = await db.submission.findMany({
        where: {
          studentId: session.user.id,
          assignmentId: { in: assignments.map((a) => a.id) },
        },
        orderBy: { submittedAt: "desc" },
      });
      assignments = assignments.map((a) => ({
        ...a,
        submissions: submissions.filter((s) => s.assignmentId === a.id),
      }));
    }
  } catch (err) {
    console.error("[lesson-player] DB error:", err);
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">تعذّر تحميل الدرس. حاول مرة أخرى.</p>
        <Link href="/student/courses" className="mt-4 inline-block">
          <Button variant="outline">العودة لدوراتي</Button>
        </Link>
      </div>
    );
  }

  // Build flat lesson list for prev/next navigation
  const allLessons: any[] = [];
  sections.forEach((s: any) => {
    s.lessons.forEach((l: any) => allLessons.push({ ...l, sectionTitle: s.title }));
  });
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Calculate progress
  const totalLessons = allLessons.length;
  const currentIndexDisplay = currentIndex + 1;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/student/courses" className="hover:text-foreground">دوراتي</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{course.titleAr || course.title}</span>
      </div>

      {/* Lesson header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground mb-1">{lesson.sectionTitle || "المحتوى"}</div>
          <h1 className="text-2xl lg:text-3xl font-bold">{lesson.title}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {Math.floor(lesson.duration / 60)}:{String(lesson.duration % 60).padStart(2, "0")} دقيقة
            </span>
            <span>الدرس {currentIndexDisplay.toLocaleString("ar-SA")} من {totalLessons.toLocaleString("ar-SA")}</span>
          </div>
        </div>
        <ProgressRing value={enrollment.progress} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content (video + description + assignments) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video player */}
          <Card className="rounded-2xl border-border/60 overflow-hidden">
            <div className="aspect-video bg-black flex items-center justify-center relative">
              {lesson.videoUrl ? (
                <LessonVideoPlayer
                  src={lesson.videoUrl}
                  poster={lesson.thumbnailUrl || undefined}
                  courseId={courseId}
                  lessonId={lessonId}
                />
              ) : (
                <div className="text-center text-white/70">
                  <Play className="h-16 w-16 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">لا يوجد فيديو لهذا الدرس بعد</p>
                </div>
              )}
            </div>
          </Card>

          {/* Lesson description */}
          {lesson.description && (
            <Card className="rounded-2xl border-border/60">
              <CardContent className="p-5">
                <h2 className="font-bold mb-2">عن هذا الدرس</h2>
                <p className="text-muted-foreground leading-relaxed">{lesson.description}</p>
              </CardContent>
            </Card>
          )}

          {/* PDF attachment */}
          {lesson.pdfUrl && (
            <Card className="rounded-2xl border-border/60">
              <CardContent className="p-5">
                <a
                  href={lesson.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="h-10 w-10 rounded-xl bg-[#D65221]/10 flex items-center justify-center text-[#D65221]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">مرفق PDF</div>
                    <div className="text-xs text-muted-foreground">اضغط للتحميل</div>
                  </div>
                </a>
              </CardContent>
            </Card>
          )}

          {/* Assignments */}
          {assignments.length > 0 && (
            <Card className="rounded-2xl border-border/60">
              <CardContent className="p-5 space-y-3">
                <h2 className="font-bold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#00A3AA]" />
                  واجبات هذا الدرس
                </h2>
                {assignments.map((a) => {
                  const latestSub = a.submissions?.[0];
                  return (
                    <div key={a.id} className="p-3 rounded-xl bg-muted/30">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-medium">{a.title}</div>
                          {a.instructions && (
                            <p className="text-xs text-muted-foreground mt-1">{a.instructions}</p>
                          )}
                          {latestSub && (
                            <Badge className="mt-2 bg-[#00A3AA]/10 text-[#00A3AA]">
                              {latestSub.status === "CRITIQUED" ? "تم النقد" : latestSub.status === "SUBMITTED" ? "بانتظار النقد" : latestSub.status}
                            </Badge>
                          )}
                        </div>
                        <Link href={`/student/submit/${a.id}`}>
                          <Button size="sm" className="rounded-xl brand-gradient text-white hover:opacity-90">
                            {latestSub ? "عرض التسليم" : "تسليم الواجب"}
                            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Prev/Next navigation */}
          <div className="flex items-center justify-between gap-3">
            {prevLesson ? (
              <Link href={`/student/learn/${courseId}/${prevLesson.id}`}>
                <Button variant="outline" className="rounded-xl">
                  <ArrowRight className="h-4 w-4 ml-1" />
                  الدرس السابق
                </Button>
              </Link>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Link href={`/student/learn/${courseId}/${nextLesson.id}`}>
                <Button className="rounded-xl brand-gradient text-white hover:opacity-90">
                  الدرس التالي
                  <ArrowLeft className="h-4 w-4 mr-1" />
                </Button>
              </Link>
            ) : (
              <Link href="/student/courses">
                <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                  <CheckCircle2 className="h-4 w-4 ml-1" />
                  إنهاء الدورة
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Sidebar: course curriculum */}
        <div className="lg:col-span-1">
          <Card className="rounded-2xl border-border/60 sticky top-6">
            <CardContent className="p-4">
              <h3 className="font-bold mb-3">محتوى الدورة</h3>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto nice-scroll">
                {sections.map((section: any) => (
                  <div key={section.id}>
                    <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                      {section.title}
                    </div>
                    <div className="space-y-1">
                      {section.lessons.map((l: any) => {
                        const isCurrent = l.id === lessonId;
                        const isLocked = false; // could add lock logic
                        return (
                          <Link
                            key={l.id}
                            href={`/student/learn/${courseId}/${l.id}`}
                            className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-colors ${
                              isCurrent
                                ? "brand-gradient-soft border border-[#0A9ED9]/30 font-medium"
                                : "hover:bg-muted/50"
                            }`}
                          >
                            <div className="shrink-0">
                              {isLocked ? (
                                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                              ) : (
                                <Play className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                            </div>
                            <span className="flex-1 truncate">{l.title}</span>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {Math.floor(l.duration / 60)}د
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
