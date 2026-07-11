import { auth } from "@/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Upload, FileImage } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SubmissionStatusBadge } from "@/components/dashboard/status-badges";
import { SubmissionForm } from "@/components/student/submission-form";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ assignmentId: string }>;
}

export default async function SubmitAssignmentPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "STUDENT") {
    redirect(`/${session.user.role.toLowerCase()}`);
  }

  const { assignmentId } = await params;

  let assignment: any = null;
  let existingSubmission: any = null;
  let notEnrolled = false;
  let dbError = false;

  try {
    assignment = await db.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: { select: { id: true, titleAr: true, title: true } },
        lesson: { select: { id: true, title: true } },
      },
    });

    if (!assignment) notFound();

    // Find student's enrollment for this course
    const enrollment = await db.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: assignment.courseId,
        },
      },
    });

    if (!enrollment || enrollment.status !== "ACTIVE") {
      notEnrolled = true;
    } else {
      // Get existing submission (most recent)
      existingSubmission = await db.submission.findFirst({
        where: {
          assignmentId,
          studentId: session.user.id,
        },
        orderBy: { submittedAt: "desc" },
      });
    }
  } catch (err) {
    console.error("[submit-page] DB error:", err);
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">تعذّر تحميل الواجب. حاول مرة أخرى.</p>
      </div>
    );
  }

  if (notEnrolled) {
    return (
      <div className="text-center py-20 max-w-md mx-auto">
        <FileImage className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <p className="font-semibold mb-2">غير مسجّل في هذه الدورة</p>
        <p className="text-sm text-muted-foreground mb-6">
          يجب أن تكون مسجّلاً بشكل نشط في الدورة لتسليم الواجبات
        </p>
        <Link href="/student/courses">
          <Button className="rounded-xl brand-gradient text-white">دوراتي</Button>
        </Link>
      </div>
    );
  }

  const canResubmit =
    !existingSubmission ||
    assignment.allowResubmission !== false; // default true if undefined

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/student/courses" className="hover:text-foreground">دوراتي</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{assignment.course.titleAr || assignment.course.title}</span>
        <span>/</span>
        <span>تسليم واجب</span>
      </div>

      {/* Assignment info */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <CardTitle>{assignment.title}</CardTitle>
          <CardDescription>
            {assignment.course.titleAr || assignment.course.title}
            {assignment.lesson ? ` — ${assignment.lesson.title}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {assignment.description && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-1">الوصف</div>
              <p className="text-sm leading-relaxed">{assignment.description}</p>
            </div>
          )}
          {assignment.instructions && (
            <div className="p-3 rounded-xl bg-[#00A3AA]/5 border border-[#00A3AA]/20">
              <div className="text-xs font-semibold text-[#00A3AA] mb-1">التعليمات</div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{assignment.instructions}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-3 text-xs">
            {assignment.requiresExif && (
              <Badge className="bg-[#0A9ED9]/10 text-[#0A9ED9]">
                <FileImage className="h-3 w-3 ml-1" />
                يجب رفع صورة ببيانات EXIF أصلية
              </Badge>
            )}
            {assignment.dueDate && (
              <Badge variant="outline">
                الموعد النهائي: {new Date(assignment.dueDate).toLocaleDateString("ar-SA")}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Existing submission */}
      {existingSubmission && (
        <Card className="rounded-2xl border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">تسليمك السابق</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <SubmissionStatusBadge status={existingSubmission.status} />
              <span className="text-xs text-muted-foreground">
                {new Date(existingSubmission.submittedAt).toLocaleString("ar-SA")}
              </span>
            </div>
            {existingSubmission.imageUrl && (
              <div className="rounded-xl overflow-hidden border border-border">
                { }
                <img
                  src={existingSubmission.imageUrl}
                  alt="عملك السابق"
                  className="w-full max-h-80 object-contain bg-muted/30"
                />
              </div>
            )}
            {existingSubmission.caption && (
              <p className="text-sm">{existingSubmission.caption}</p>
            )}
            {existingSubmission.critique && (
              <div className="p-3 rounded-xl bg-[#00A3AA]/5 border border-[#00A3AA]/20">
                <div className="text-xs font-semibold text-[#00A3AA] mb-1">نقد المدرّب</div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{existingSubmission.critique}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Submission form */}
      {canResubmit ? (
        <SubmissionForm
          assignmentId={assignment.id}
          enrollmentId={assignment.courseId /* placeholder */}
          lessonId={assignment.lessonId}
          studentId={session.user.id}
          existingSubmission={existingSubmission}
        />
      ) : (
        <Card className="rounded-2xl border-amber-200 bg-amber-50/40">
          <CardContent className="p-5 text-center">
            <p className="text-sm text-amber-700">
              تم تسليم هذا الواجب ولا يمكن إعادة التسليم. انتظر نقد المدرّب.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
