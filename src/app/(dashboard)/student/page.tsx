import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { BookOpen, ReceiptText, Award, Clock, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function StudentOverviewPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  // Parallel queries
  const [enrollments, pendingPayments, certificates] = await Promise.all([
    db.enrollment.findMany({
      where: { studentId: session.user.id },
      include: {
        course: { select: { id: true, titleAr: true, title: true, thumbnailUrl: true } },
      },
      orderBy: { enrolledAt: "desc" },
      take: 5,
    }),
    db.paymentReceipt.count({
      where: { studentId: session.user.id, status: "PENDING" },
    }),
    db.certificate.count({
      where: { studentId: session.user.id },
    }),
  ]);

  const activeCourses = enrollments.filter((e) => e.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">
          أهلاً، {session.user.name?.split(" ")[0] || "طالبتي"} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          استكمل رحلتك في عالم التصوير
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard
          icon={<BookOpen className="h-5 w-5" />}
          label="دورات نشطة"
          value={activeCourses}
          tint="from-[#0A9ED9]/10 to-[#0A9ED9]/5"
          iconColor="text-[#0A9ED9]"
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="بانتظار الموافقة"
          value={pendingPayments}
          tint="from-amber-100/60 to-amber-50/40"
          iconColor="text-amber-600"
        />
        <StatCard
          icon={<Award className="h-5 w-5" />}
          label="شهاداتي"
          value={certificates}
          tint="from-[#00A3AA]/10 to-[#00A3AA]/5"
          iconColor="text-[#00A3AA]"
        />
        <StatCard
          icon={<ReceiptText className="h-5 w-5" />}
          label="إجمالي التسجيلات"
          value={enrollments.length}
          tint="from-[#D65221]/10 to-[#D65221]/5"
          iconColor="text-[#D65221]"
        />
      </div>

      {/* Current courses */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">دوراتي الحالية</CardTitle>
          <Link
            href="/student/courses"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            عرض الكل
            <ArrowLeft className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <EmptyState
              title="لا توجد دورات بعد"
              hint="استكشف الدورات المتاحة وابدأ رحلتك"
              cta={{ href: "/", label: "تصفّح الدورات" }}
            />
          ) : (
            <div className="space-y-3">
              {enrollments.map((enr) => (
                <div
                  key={enr.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/40 transition-colors"
                >
                  <div className="h-12 w-12 rounded-lg brand-gradient-soft border border-border/40 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {enr.course.titleAr || enr.course.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      التقدّم: {Math.round(enr.progress)}%
                    </div>
                  </div>
                  <EnrollmentStatusBadge status={enr.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tint,
  iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tint: string;
  iconColor: string;
}) {
  return (
    <Card className={`rounded-2xl border-border/40 bg-gradient-to-bl ${tint}`}>
      <CardContent className="p-4">
        <div className={`mb-2 ${iconColor}`}>{icon}</div>
        <div className="text-2xl lg:text-3xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  title,
  hint,
  cta,
}: {
  title: string;
  hint: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="text-center py-10">
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground mt-1">{hint}</p>
      {cta && (
        <Link
          href={cta.href}
          className="inline-flex items-center gap-1 mt-4 px-4 py-2 rounded-xl brand-gradient text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {cta.label}
          <ArrowLeft className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

function EnrollmentStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    PENDING_PAYMENT: { label: "بانتظار الدفع", cls: "bg-amber-100 text-amber-700" },
    PENDING_APPROVAL: { label: "قيد المراجعة", cls: "bg-blue-100 text-blue-700" },
    ACTIVE: { label: "نشط", cls: "bg-emerald-100 text-emerald-700" },
    COMPLETED: { label: "مكتمل", cls: "bg-teal-100 text-teal-700" },
    EXPIRED: { label: "منتهي", cls: "bg-red-100 text-red-700" },
    CANCELLED: { label: "ملغى", cls: "bg-zinc-100 text-zinc-700" },
    REFUNDED: { label: "مُسترد", cls: "bg-purple-100 text-purple-700" },
  };
  const m = map[status] || { label: status, cls: "bg-muted text-muted-foreground" };
  return <Badge className={`${m.cls} hover:opacity-90`}>{m.label}</Badge>;
}
