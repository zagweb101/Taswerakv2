import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { CoursesPendingList } from "@/components/admin/courses-pending-list";

export const dynamic = "force-dynamic";

export default async function AdminPendingCoursesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") {
    redirect(`/${session.user.role.toLowerCase()}`);
  }

  const courses = await db.course.findMany({
    where: {
      status: "PENDING_REVIEW",
    },
    include: {
      instructor: {
        select: {
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          sections: true,
        },
      },
    },
    orderBy: {
      submittedAt: "asc",
    },
  });

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="مراجعة واعتماد الدورات"
        description="استعرض طلبات النشر المقدمة من المدرسين وقبولها أو رفضها مع ذكر الأسباب."
      />
      <CoursesPendingList courses={courses as any} />
    </div>
  );
}
