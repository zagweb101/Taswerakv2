import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { studentNav } from "@/components/dashboard/student-sidebar";

export const dynamic = "force-dynamic";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") {
    redirect(`/${session.user.role.toLowerCase()}`);
  }

  // Check maintenance mode (admin bypasses)
  try {
    const flag = await db.cmsContent.findUnique({
      where: { key: "admin_settings_flags" },
    });
    if (flag?.value) {
      const flags = JSON.parse(flag.value);
      if (flags.maintenanceMode === true) {
        redirect("/maintenance");
      }
    }
  } catch {
    // DB unavailable — allow access (don't block on DB error)
  }

  // Check if admin is impersonating this student
  const impersonatedBy = (session.user as any).impersonatedBy as string | undefined;

  return (
    <DashboardShell
      role="student"
      roleLabel="طالب"
      navItems={studentNav}
      userName={session.user.name}
      userEmail={session.user.email}
      impersonatedTargetId={impersonatedBy ? session.user.id : null}
      impersonatedTargetName={impersonatedBy ? session.user.name : null}
    >
      {children}
    </DashboardShell>
  );
}
