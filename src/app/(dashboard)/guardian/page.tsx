import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Users, BookOpen, Award, TrendingUp, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProgressRing } from "@/components/dashboard/status-badges";

export const dynamic = "force-dynamic";

export default async function GuardianDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "GUARDIAN") redirect(`/${session.user.role.toLowerCase()}`);

  let students: any[] = [];
  let dbError = false;
  try {
    const links = await db.guardianLink.findMany({
      where: { guardianId: session.user.id },
      include: {
        student: {
          select: {
            id: true, name: true, email: true,
            enrollments: {
              include: { course: { select: { id: true, titleAr: true, title: true, durationHours: true } } },
              orderBy: { enrolledAt: "desc" },
            },
            certificates: {
              include: { course: { select: { titleAr: true, title: true } } },
              orderBy: { issuedAt: "desc" },
            },
          },
        },
      },
    });
    students = links.map((l) => l.student);
  } catch {
    dbError = true;
  }

  const navItems = [
    { href: "/guardian", label: "نظرة عامة", icon: <TrendingUp className="h-4 w-4" /> },
  ];

  return (
    <DashboardShell role="guardian" roleLabel="ولي أمر" navItems={navItems} userName={session.user.name} userEmail={session.user.email}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">أهلاً، {session.user.name?.split(" ")[0] || "ولي الأمر"} 👋</h1>
          <p className="text-muted-foreground mt-1">تابع تقدّم أبنائك في رحلة التعلّم</p>
        </div>

        {dbError ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground">تعذّر تحميل البيانات</CardContent></Card>
        ) : students.length === 0 ? (
          <Card><CardContent className="p-10 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="font-semibold">لا يطلاب مرتبطون بك</p>
            <p className="text-sm text-muted-foreground mt-1">تواصل مع الإدارة لربط حسابك بأبنائك</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-4">
            {students.map((s) => (
              <Card key={s.id} className="rounded-2xl border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full brand-gradient flex items-center justify-center text-white font-bold">
                      {s.name?.charAt(0) || "؟"}
                    </div>
                    {s.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Enrollments */}
                  {s.enrollments?.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground mb-2">الدورات المسجّلة</div>
                      {s.enrollments.map((enr: any) => (
                        <div key={enr.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 mb-1">
                          <BookOpen className="h-4 w-4 text-[#0A9ED9] shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{enr.course.titleAr || enr.course.title}</div>
                            <div className="text-xs text-muted-foreground">الحالة: {enr.status}</div>
                          </div>
                          <ProgressRing value={enr.progress} />
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Certificates */}
                  {s.certificates?.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground mb-2">الشهادات</div>
                      {s.certificates.map((c: any) => (
                        <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg bg-[#D65221]/5 border border-[#D65221]/20 mb-1">
                          <Award className="h-4 w-4 text-[#D65221] shrink-0" />
                          <div className="flex-1">
                            <div className="text-sm font-medium">{c.course.titleAr || c.course.title}</div>
                            <div className="text-xs text-muted-foreground font-mono" dir="ltr">{c.certificateNumber}</div>
                          </div>
                          {c.grade && <Badge className="bg-[#D65221]/10 text-[#D65221]">{c.grade}</Badge>}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
