import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { SupportTicketList } from "@/components/student/support/support-list";

export const dynamic = "force-dynamic";

export default async function StudentSupportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "STUDENT") redirect(`/${session.user.role.toLowerCase()}`);

  let tickets: any[] = [];
  let dbError = false;
  try {
    tickets = await db.supportTicket.findMany({
      where: { studentId: session.user.id },
      include: {
        course: { select: { titleAr: true, title: true } },
        _count: { select: { replies: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    dbError = true;
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="الدعم الفني"
        description="افتح تذكرة دعم وسنرد عليك في أقرب وقت"
      />
      <SupportTicketList tickets={tickets as any} dbError={dbError} />
    </div>
  );
}
