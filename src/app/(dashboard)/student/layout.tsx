import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { studentNav } from "@/components/dashboard/student-sidebar";

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

  return (
    <DashboardShell
      role="student"
      roleLabel="طالب"
      navItems={studentNav}
      userName={session.user.name}
      userEmail={session.user.email}
    >
      {children}
    </DashboardShell>
  );
}
