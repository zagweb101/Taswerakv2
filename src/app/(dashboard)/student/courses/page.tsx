import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { BookOpen, ArrowLeft, Clock, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { DashboardEmptyState } from "@/components/dashboard/empty-state";
import {
  EnrollmentStatusBadge,
  ProgressRing,
} from "@/components/dashboard/status-badges";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

// Fallback mock data — used when DB is unavailable (dev sandbox without postgres)
const mockEnrollments = [
  {
    id: "m1",
    status: "ACTIVE",
    progress: 65,
    course: {
      id: "c1",
      slug: "beauty-photography-12-lectures",
      titleAr: "تصوير البيوتي Beauty",
      title: "Beauty Photography",
      category: "بيوتي",
      durationHours: 24,
    },
    enrolledAt: new Date("2026-06-01"),
  },
  {
    id: "m2",
    status: "PENDING_APPROVAL",
    progress: 0,
    course: {
      id: "c2",
      slug: "makeup-tutorial-photography",
      titleAr: "ميكب توتوريال",
      title: "Makeup Tutorial",
      category: "مكياج",
      durationHours: 16,
    },
    enrolledAt: new Date("2026-07-09"),
  },
  {
    id: "m3",
    status: "COMPLETED",
    progress: 100,
    course: {
      id: "c3",
      slug: "photography-fundamentals",
      titleAr: "أساسيات التصوير",
      title: "Fundamentals",
      category: "أساسيات",
      durationHours: 12,
    },
    enrolledAt: new Date("2026-04-15"),
  },
];

export default async function StudentCoursesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const enrollments = await db.enrollment.findMany({
    where: { studentId: session.user.id },
    include: {
      course: {
        select: {
          id: true,
          slug: true,
          titleAr: true,
          title: true,
          category: true,
          durationHours: true,
          thumbnailUrl: true,
          sections: {
            orderBy: { order: "asc" },
            select: {
              lessons: {
                orderBy: { order: "asc" },
                select: { id: true },
                take: 1,
              },
            },
          },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  // Helper: find first lesson id from enrollment
  const getFirstLessonId = (enr: any): string | null => {
    const sections = enr.course?.sections;
    if (!sections || sections.length === 0) return null;
    for (const s of sections) {
      if (s.lessons && s.lessons.length > 0) return s.lessons[0].id;
    }
    return null;
  };

  const active = enrollments.filter((e) => e.status === "ACTIVE");
  const completed = enrollments.filter((e) => e.status === "COMPLETED");
  const pending = enrollments.filter((e) =>
    ["PENDING_PAYMENT", "PENDING_APPROVAL"].includes(e.status)
  );

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="دوراتي"
        description="تتبّع تقدّمك في كل دورة"
        actions={
          <Link href="/courses">
            <Button className="rounded-xl brand-gradient text-white hover:opacity-90">
              استكشف دورات جديدة
              <ArrowLeft className="h-4 w-4 mr-1" />
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-card border border-border/40 p-4 text-center">
          <div className="text-2xl font-bold text-[#0A9ED9]">{active.length}</div>
          <div className="text-xs text-muted-foreground mt-1">نشطة</div>
        </div>
        <div className="rounded-2xl bg-card border border-border/40 p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{pending.length}</div>
          <div className="text-xs text-muted-foreground mt-1">قيد المراجعة</div>
        </div>
        <div className="rounded-2xl bg-card border border-border/40 p-4 text-center">
          <div className="text-2xl font-bold text-[#00A3AA]">{completed.length}</div>
          <div className="text-xs text-muted-foreground mt-1">مكتملة</div>
        </div>
      </div>

      {/* Course list */}
      {enrollments.length === 0 ? (
        <Card className="rounded-2xl border-border/60">
          <CardContent>
            <DashboardEmptyState
              icon={<BookOpen className="h-6 w-6" />}
              title="لم تبدأ أي دورة بعد"
              hint="تصفّح الدورات المتاحة وابدأ رحلتك في التصوير"
              cta={{ href: "/courses", label: "تصفّح الدورات" }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {enrollments.map((enr) => (
            <Card key={enr.id} className="rounded-2xl border-border/60 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="h-16 w-16 rounded-xl brand-gradient-soft border border-border/40 flex items-center justify-center shrink-0">
                    <BookOpen className="h-7 w-7 text-muted-foreground" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base truncate">
                      {enr.course.titleAr || enr.course.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {enr.course.durationHours} ساعة
                      </span>
                      <span>{enr.course.category}</span>
                      <span>سُجّلت في {new Date(enr.enrolledAt).toLocaleDateString("ar-SA")}</span>
                    </div>
                  </div>

                  {/* Progress ring */}
                  {enr.status === "ACTIVE" && (
                    <div className="hidden sm:block">
                      <ProgressRing value={enr.progress} />
                    </div>
                  )}

                  {/* Status */}
                  <EnrollmentStatusBadge status={enr.status} />

                  {/* Action */}
                  {enr.status === "ACTIVE" && (() => {
                    const firstLessonId = getFirstLessonId(enr);
                    const targetHref = firstLessonId
                      ? `/student/learn/${enr.course.id}/${firstLessonId}`
                      : `/courses/${enr.course.slug}`;
                    return (
                      <Link href={targetHref}>
                        <Button size="sm" className="rounded-xl brand-gradient text-white hover:opacity-90">
                          متابعة
                          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                        </Button>
                      </Link>
                    );
                  })()}
                  {enr.status === "COMPLETED" && (
                    <Link href="/student/certificates">
                      <Button size="sm" variant="outline" className="rounded-xl">
                        <Award className="h-3.5 w-3.5 ml-1" />
                        الشهادة
                      </Button>
                    </Link>
                  )}
                  {enr.status === "PENDING_APPROVAL" && (
                    <Link href="/student/payments">
                      <Button size="sm" variant="outline" className="rounded-xl">
                        تفاصيل الدفع
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Mobile progress bar */}
                {enr.status === "ACTIVE" && (
                  <div className="mt-3 sm:hidden">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full brand-gradient"
                        style={{ width: `${enr.progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      التقدّم: {Math.round(enr.progress)}%
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
