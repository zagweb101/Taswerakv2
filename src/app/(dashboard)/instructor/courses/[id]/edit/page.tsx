import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { CourseEditor } from "@/components/instructor/course-builder/course-editor";
import { DashboardPageHeader } from "@/components/dashboard/page-header";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCoursePage({ params }: PageProps) {
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
        _count: { select: { enrollments: true } },
      },
    });
    if (!course) notFound();
    if (session.user.role === "INSTRUCTOR" && course.instructorId !== session.user.id) {
      redirect("/instructor/courses");
    }
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={`تحرير: ${course.titleAr || course.title}`}
        description={`${course._count.enrollments} طالب مسجّل · ${course.sections.length} قسم`}
      />
      <CourseEditor mode="edit" courseId={course.id} initialData={course} instructorId={session.user.id} />
    </div>
  );
}
