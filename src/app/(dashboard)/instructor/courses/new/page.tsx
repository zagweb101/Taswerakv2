import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CourseEditor } from "@/components/instructor/course-builder/course-editor";
import { DashboardPageHeader } from "@/components/dashboard/page-header";

export const dynamic = "force-dynamic";

export default async function NewCoursePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
    redirect(`/${session.user.role.toLowerCase()}`);
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="دورة جديدة"
        description="أنشئ دورة جديدة — ابدأ بالبيانات الأساسية ثم أضف الأقسام والدروس"
      />
      <CourseEditor mode="create" instructorId={session.user.id} />
    </div>
  );
}
