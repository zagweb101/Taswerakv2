import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { instructorNav } from "@/components/dashboard/instructor-sidebar";

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "INSTRUCTOR") {
    redirect(`/${session.user.role.toLowerCase()}`);
  }

  const impersonatedBy = (session.user as any).impersonatedBy as string | undefined;

  return (
    <DashboardShell
      role="instructor"
      roleLabel="مدرّب"
      navItems={instructorNav}
      userName={session.user.name}
      userEmail={session.user.email}
      impersonatedTargetId={impersonatedBy ? session.user.id : null}
      impersonatedTargetName={impersonatedBy ? session.user.name : null}
    >
      {children}
    </DashboardShell>
  );
}
