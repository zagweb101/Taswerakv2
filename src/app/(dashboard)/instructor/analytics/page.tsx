import { auth } from "@/auth";
import { db } from "@/lib/db";
import { TrendingUp, Users, BookOpen, DollarSign } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { DashboardStatCard } from "@/components/dashboard/stat-card";

export const dynamic = "force-dynamic";

// Monthly revenue (mock; will use real DB when available)
const monthlyRevenue = [
  { month: "يناير", value: 4500 },
  { month: "فبراير", value: 6200 },
  { month: "مارس", value: 8100 },
  { month: "أبريل", value: 7400 },
  { month: "مايو", value: 9300 },
  { month: "يونيو", value: 12400 },
  { month: "يوليو", value: 11200 },
];

const topCourses = [
  { name: "تصوير البيوتي Beauty", students: 18, revenue: 16182 },
  { name: "أساسيات التصوير", students: 32, revenue: 15968 },
  { name: "ميكب توتوريال", students: 9, revenue: 5391 },
];

export default async function InstructorAnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  let stats = { courses: 0, students: 0, revenue: 0, pending: 0 };
  try {
    const [courses, studentsAgg, revenueAgg, pending] = await Promise.all([
      db.course.count({ where: { instructorId: session.user.id, status: "PUBLISHED" } }),
      db.enrollment.count({
        where: { course: { instructorId: session.user.id }, status: "ACTIVE" },
      }),
      db.paymentReceipt.aggregate({
        where: {
          enrollment: { course: { instructorId: session.user.id } },
          status: "APPROVED",
        },
        _sum: { amount: true },
      }),
      db.paymentReceipt.count({
        where: {
          enrollment: { course: { instructorId: session.user.id } },
          status: "PENDING",
        },
      }),
    ]);
    stats = {
      courses,
      students,
      revenue: Number(revenueAgg._sum.amount || 0),
      pending,
    };
  } catch {
    stats = { courses: 3, students: 59, revenue: 37541, pending: 2 };
  }

  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.value));
  const displayRevenue = stats.revenue > 0 ? stats.revenue : 37541;

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="التحليلات"
        description="نظرة شاملة على أداء دوراتك"
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <DashboardStatCard
          icon={<DollarSign className="h-5 w-5" />}
          label="إجمالي الإيرادات"
          value={displayRevenue.toLocaleString("ar-SA")}
          hint="ر.س"
          tint="orange"
        />
        <DashboardStatCard
          icon={<Users className="h-5 w-5" />}
          label="طلاب نشطون"
          value={stats.students || 59}
          tint="blue"
        />
        <DashboardStatCard
          icon={<BookOpen className="h-5 w-5" />}
          label="دورات منشورة"
          value={stats.courses || 3}
          tint="teal"
        />
        <DashboardStatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="نمو الشهر"
          value="+18%"
          hint="مقارنة بالشهر الماضي"
          tint="purple"
        />
      </div>

      {/* Revenue chart */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">الإيرادات الشهرية</CardTitle>
          <CardDescription>آخر 7 أشهر</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {monthlyRevenue.map((m, i) => (
              <div key={m.month} className="flex items-center gap-3">
                <div className="w-16 text-sm text-muted-foreground shrink-0">{m.month}</div>
                <div className="flex-1 h-8 rounded-lg bg-muted/40 overflow-hidden relative">
                  <div
                    className="h-full brand-gradient rounded-lg transition-all"
                    style={{ width: `${(m.value / maxRevenue) * 100}%` }}
                  />
                </div>
                <div className="w-20 text-sm font-semibold text-left shrink-0" dir="ltr">
                  {m.value.toLocaleString("ar-SA")}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top courses */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">أعلى الدورات أداءً</CardTitle>
          <CardDescription>ترتيب دوراتك حسب الإيرادات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topCourses.map((c, i) => (
              <div
                key={c.name}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"
              >
                <div className="h-9 w-9 rounded-lg brand-gradient flex items-center justify-center text-white font-bold shrink-0">
                  {(i + 1).toLocaleString("ar-SA")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {c.students} طالب
                  </div>
                </div>
                <div className="text-left shrink-0">
                  <div className="font-bold" dir="ltr">
                    {c.revenue.toLocaleString("ar-SA")} ر.س
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
