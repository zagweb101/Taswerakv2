import { auth } from "@/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BookOpen, Award, Clock, TrendingUp, FileImage, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ProgressRing, SubmissionStatusBadge, EnrollmentStatusBadge } from "@/components/dashboard/status-badges";
import { DashboardPageHeader } from "@/components/dashboard/page-header";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InstructorStudentDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
    redirect(`/${session.user.role.toLowerCase()}`);
  }

  const { id: studentId } = await params;

  let student: any = null;
  let enrollments: any[] = [];
  let submissions: any[] = [];
  let certificates: any[] = [];

  try {
    student = await db.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!student) notFound();

    // Get enrollments in instructor's courses
    const where: any = { studentId };
    if (session.user.role === "INSTRUCTOR") {
      where.course = { instructorId: session.user.id };
    }

    [enrollments, submissions, certificates] = await Promise.all([
      db.enrollment.findMany({
        where,
        include: {
          course: {
            select: {
              id: true,
              titleAr: true,
              title: true,
              durationHours: true,
              sections: {
                orderBy: { order: "asc" },
                select: {
                  lessons: { select: { id: true }, orderBy: { order: "asc" } },
                },
              },
            },
          },
        },
        orderBy: { enrolledAt: "desc" },
      }),
      db.submission.findMany({
        where: {
          studentId,
          assignment: {
            course: session.user.role === "INSTRUCTOR"
              ? { instructorId: session.user.id }
              : undefined,
          },
        },
        include: {
          assignment: {
            include: {
              course: { select: { id: true, titleAr: true, title: true } },
              lesson: { select: { id: true, title: true } },
            },
          },
        },
        orderBy: { submittedAt: "desc" },
        take: 20,
      }),
      db.certificate.findMany({
        where: { studentId },
        include: {
          course: { select: { id: true, titleAr: true, title: true } },
        },
        orderBy: { issuedAt: "desc" },
      }),
    ]);
  } catch (err) {
    console.error("[student-detail] DB error:", err);
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">تعذّر تحميل بيانات الطالب.</p>
      </div>
    );
  }

  // Calculate aggregate stats
  const totalCourses = enrollments.length;
  const activeCourses = enrollments.filter((e) => e.status === "ACTIVE").length;
  const completedCourses = enrollments.filter((e) => e.status === "COMPLETED").length;
  const totalSubmissions = submissions.length;
  const critiquedSubmissions = submissions.filter((s) => s.status === "CRITIQUED" || s.status === "APPROVED").length;
  const pendingSubmissions = submissions.filter((s) => s.status === "SUBMITTED" || s.status === "UNDER_REVIEW").length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/instructor/courses" className="hover:text-foreground">دوراتي</Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate">{student.name || "طالب"}</span>
      </div>

      {/* Student header */}
      <Card className="rounded-2xl border-border/60">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="brand-gradient text-white text-xl font-bold">
                {(student.name || "؟").charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold">{student.name || "—"}</h1>
              <p className="text-sm text-muted-foreground" dir="ltr">{student.email}</p>
              {student.phone && (
                <p className="text-xs text-muted-foreground mt-1" dir="ltr">{student.phone}</p>
              )}
              {student.bio && (
                <p className="text-sm mt-2 text-muted-foreground">{student.bio}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                انضم في {new Date(student.createdAt).toLocaleDateString("ar-SA")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="rounded-2xl border-border/40 bg-gradient-to-bl from-[#0A9ED9]/10 to-[#0A9ED9]/5">
          <CardContent className="p-4">
            <BookOpen className="h-5 w-5 mb-2 text-[#0A9ED9]" />
            <div className="text-2xl font-bold">{activeCourses}</div>
            <div className="text-xs text-muted-foreground">دورات نشطة</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/40 bg-gradient-to-bl from-[#00A3AA]/10 to-[#00A3AA]/5">
          <CardContent className="p-4">
            <Award className="h-5 w-5 mb-2 text-[#00A3AA]" />
            <div className="text-2xl font-bold">{completedCourses}</div>
            <div className="text-xs text-muted-foreground">دورات مكتملة</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/40 bg-gradient-to-bl from-[#D65221]/10 to-[#D65221]/5">
          <CardContent className="p-4">
            <FileImage className="h-5 w-5 mb-2 text-[#D65221]" />
            <div className="text-2xl font-bold">{totalSubmissions}</div>
            <div className="text-xs text-muted-foreground">إجمالي التسليمات</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/40 bg-amber-50/40">
          <CardContent className="p-4">
            <Clock className="h-5 w-5 mb-2 text-amber-600" />
            <div className="text-2xl font-bold text-amber-600">{pendingSubmissions}</div>
            <div className="text-xs text-muted-foreground">بانتظار النقد</div>
          </CardContent>
        </Card>
      </div>

      {/* Enrolled courses with progress */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#0A9ED9]" />
            الدورات المسجّلة
          </CardTitle>
          <CardDescription>تقدّم الطالب في كل دورة</CardDescription>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              هذا الطالب غير مسجّل في أي من دوراتك
            </p>
          ) : (
            <div className="space-y-3">
              {enrollments.map((enr) => {
                const totalLessons = enr.course.sections.reduce(
                  (sum: number, s: any) => sum + s.lessons.length,
                  0
                );
                const firstLesson = enr.course.sections?.[0]?.lessons?.[0];
                return (
                  <div
                    key={enr.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-12 w-12 rounded-lg brand-gradient-soft border border-border/40 flex items-center justify-center shrink-0">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">
                        {enr.course.titleAr || enr.course.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {totalLessons} درس · {enr.course.durationHours} ساعة · سُجّل في {new Date(enr.enrolledAt).toLocaleDateString("ar-SA")}
                      </div>
                      {/* Progress bar */}
                      <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden max-w-xs">
                        <div
                          className="h-full brand-gradient"
                          style={{ width: `${enr.progress}%` }}
                        />
                      </div>
                    </div>
                    <ProgressRing value={enr.progress} />
                    <EnrollmentStatusBadge status={enr.status} />
                    {enr.status === "ACTIVE" && firstLesson && (
                      <Link href={`/student/learn/${enr.course.id}/${firstLesson.id}`}>
                        <Button size="sm" variant="outline" className="rounded-xl">
                          عرض
                        </Button>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent submissions */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileImage className="h-5 w-5 text-[#D65221]" />
            التسليمات الأخيرة
          </CardTitle>
          <CardDescription>آخر {submissions.length} تسليم</CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              لا توجد تسليمات بعد
            </p>
          ) : (
            <div className="space-y-2">
              {submissions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                >
                  <div className="h-10 w-10 rounded-lg brand-gradient-soft border border-border/40 flex items-center justify-center shrink-0">
                    <FileImage className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {s.assignment.title}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {s.assignment.course.titleAr || s.assignment.course.title}
                      {s.assignment.lesson ? ` — ${s.assignment.lesson.title}` : ""}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(s.submittedAt).toLocaleDateString("ar-SA")}
                  </span>
                  <SubmissionStatusBadge status={s.status} />
                  <Link href={`/instructor/critiques/${s.id}`}>
                    <Button size="sm" variant="outline" className="rounded-xl shrink-0">
                      <MessageSquare className="h-3.5 w-3.5 ml-1" />
                      {s.status === "CRITIQUED" || s.status === "APPROVED" ? "تعديل" : "نقد"}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificates */}
      {certificates.length > 0 && (
        <Card className="rounded-2xl border-border/60">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-[#D65221]" />
              الشهادات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {certificates.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div>
                    <div className="text-sm font-medium">
                      {c.course.titleAr || c.course.title}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono" dir="ltr">
                      {c.certificateNumber}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(c.issuedAt).toLocaleDateString("ar-SA")}
                  </div>
                  {c.grade && (
                    <Badge className="bg-[#D65221]/10 text-[#D65221]">{c.grade}</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
