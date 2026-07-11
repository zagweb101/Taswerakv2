import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Users, Wallet, BookCopy, ScrollText, ArrowLeft, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [studentsCount, instructorsCount, coursesCount, pendingPaymentsCount, approvedRevenue, auditLogsCount] =
    await Promise.all([
      db.user.count({ where: { role: "STUDENT" } }),
      db.user.count({ where: { role: "INSTRUCTOR" } }),
      db.course.count(),
      db.paymentReceipt.count({ where: { status: "PENDING" } }),
      db.paymentReceipt.aggregate({
        where: { status: "APPROVED" },
        _sum: { amount: true },
      }),
      db.auditLog.count(),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">لوحة المدير</h1>
        <p className="text-muted-foreground mt-1">
          نظرة شاملة على المنصة
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="الطلاب"
          value={studentsCount}
          tint="from-[#0A9ED9]/10 to-[#0A9ED9]/5"
          iconColor="text-[#0A9ED9]"
        />
        <StatCard
          icon={<BookCopy className="h-5 w-5" />}
          label="المدرّبون"
          value={instructorsCount}
          tint="from-[#00A3AA]/10 to-[#00A3AA]/5"
          iconColor="text-[#00A3AA]"
        />
        <StatCard
          icon={<Wallet className="h-5 w-5" />}
          label="إيصالات بانتظار المراجعة"
          value={pendingPaymentsCount}
          tint="from-amber-100/60 to-amber-50/40"
          iconColor="text-amber-600"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="إجمالي الإيرادات"
          value={Number(approvedRevenue._sum.amount || 0)}
          tint="from-[#D65221]/10 to-[#D65221]/5"
          iconColor="text-[#D65221]"
          isCurrency
        />
      </div>

      {/* Secondary grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-border/60">
          <CardHeader><CardTitle className="text-base">إجراءات سريعة</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <QuickAction href="/admin/users" icon={<Users className="h-4 w-4" />} title="إدارة المستخدمين" hint={`${studentsCount + instructorsCount} مستخدم`} />
            <QuickAction href="/admin/finance" icon={<Wallet className="h-4 w-4" />} title="تصدير المالية" hint="Excel / CSV" />
            <QuickAction href="/admin/cms" icon={<BookCopy className="h-4 w-4" />} title="إدارة محتوى الواجهة" hint="Hero / Features / Testimonials" />
            <QuickAction href="/admin/audit" icon={<ScrollText className="h-4 w-4" />} title="سجل التدقيق" hint={`${auditLogsCount} حدث`} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 rounded-2xl border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">آخر أحداث النظام</CardTitle>
            <Link href="/admin/audit" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              عرض الكل
              <ArrowLeft className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                سيتم عرض آخر 5 أحداث هنا بعد تفعيل التدقيق في المرحلة 4
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tint,
  iconColor,
  isCurrency,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tint: string;
  iconColor: string;
  isCurrency?: boolean;
}) {
  return (
    <Card className={`rounded-2xl border-border/40 bg-gradient-to-bl ${tint}`}>
      <CardContent className="p-4">
        <div className={`mb-2 ${iconColor}`}>{icon}</div>
        <div className="text-2xl lg:text-3xl font-bold">
          {isCurrency ? `${Number(value).toLocaleString("ar-SA")} ر.س` : value.toLocaleString("ar-SA")}
        </div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
      </CardContent>
    </Card>
  );
}

function QuickAction({ href, icon, title, hint }: { href: string; icon: React.ReactNode; title: string; hint: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 transition-colors group">
      <div className="h-9 w-9 rounded-lg bg-muted/60 text-muted-foreground flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
      <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
    </Link>
  );
}
