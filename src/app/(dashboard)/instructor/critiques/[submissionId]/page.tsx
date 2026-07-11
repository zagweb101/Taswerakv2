import { auth } from "@/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, MessageSquare, Camera, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SubmissionStatusBadge } from "@/components/dashboard/status-badges";
import { CritiqueInterface } from "@/components/instructor/critique-interface";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ submissionId: string }>;
}

export default async function CritiquePage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
    redirect(`/${session.user.role.toLowerCase()}`);
  }

  const { submissionId } = await params;

  let submission: any = null;
  try {
    submission = await db.submission.findUnique({
      where: { id: submissionId },
      include: {
        student: { select: { id: true, name: true, email: true, image: true } },
        assignment: {
          include: {
            course: {
              select: { id: true, titleAr: true, title: true, instructorId: true },
            },
            lesson: { select: { id: true, title: true } },
          },
        },
      },
    });

    if (!submission) notFound();

    // Authorization: instructor must own the course (admin can override)
    if (
      session.user.role === "INSTRUCTOR" &&
      submission.assignment.course.instructorId !== session.user.id
    ) {
      redirect("/instructor/critiques");
    }
  } catch (err) {
    console.error("[critique-page] DB error:", err);
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">تعذّر تحميل التسليم. حاول مرة أخرى.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/instructor/critiques" className="hover:text-foreground">نقد الأعمال</Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate">
          {submission.student.name || "طالب"}
        </span>
      </div>

      {/* Submission info */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="text-lg">{submission.assignment.title}</CardTitle>
              <CardDescription>
                {submission.assignment.course.titleAr || submission.assignment.course.title}
                {submission.assignment.lesson ? ` — ${submission.assignment.lesson.title}` : ""}
              </CardDescription>
            </div>
            <SubmissionStatusBadge status={submission.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">الطالب</div>
              <div className="font-medium">{submission.student.name}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">المحاولة</div>
              <div className="font-medium">#{submission.attemptNumber}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> التسليم
              </div>
              <div className="font-medium">{new Date(submission.submittedAt).toLocaleString("ar-SA")}</div>
            </div>
          </div>

          {submission.caption && (
            <div className="p-3 rounded-xl bg-muted/30">
              <div className="text-xs font-semibold text-muted-foreground mb-1">وصف الطالب</div>
              <p className="text-sm">{submission.caption}</p>
            </div>
          )}

          {submission.exifData && (
            <div className="p-3 rounded-xl bg-[#0A9ED9]/5 border border-[#0A9ED9]/20">
              <div className="text-xs font-semibold text-[#0A9ED9] mb-2 flex items-center gap-1">
                <Camera className="h-3 w-3" /> بيانات EXIF
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {Object.entries(submission.exifData as Record<string, any>).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-muted-foreground">{k}: </span>
                    <span className="font-medium">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Critique interface */}
      <CritiqueInterface
        submissionId={submission.id}
        imageUrl={submission.imageUrl}
        existingCritique={submission.critique}
        existingPinComments={(submission.pinComments as any[]) || []}
        currentStatus={submission.status}
        reviewerId={session.user.id}
      />
    </div>
  );
}
