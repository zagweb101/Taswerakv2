import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Wallet, BookCopy, Image, TrendingUp, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StudentsNeedingAttention } from "@/components/instructor/students-needing-attention";

export const dynamic = "force-dynamic";

export default async function InstructorOverviewPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [pendingPaymentsCount, coursesCount, submissionsCount, totalRevenue] =
    await Promise.all([
      db.paymentReceipt.count({
        where: {
          enrollment: { course: { instructorId: session.user.id } },
          status: "PENDING",
        },
      }),
      db.course.count({ where: { instructorId: session.user.id } }),
      db.submission.count({
        where: { assignment: { course: { instructorId: session.user.id } } },
      }),
      db.paymentReceipt.aggregate({
        where: {
          enrollment: { course: { instructorId: session.user.id } },
          status: "APPROVED",
        },
        _sum: { amount: true },
      }),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">
          أهلاً، {session.user.name?.split(" ")[0] || "مدرّبنا"} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          إدارة دوراتك وطلابك في مكان واحد
        </p>
      </div>

      {/* Stat cards — reordered: submissions first (instructor's primary task) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard
          icon={<Image className="h-5 w-5" />}
          label="أعمال بانتظار النقد"
          value={submissionsCount}
          tint="from-[#00A3AA]/10 to-[#00A3AA]/5"
          iconColor="text-[#00A3AA]"
        />
        <StatCard
          icon={<Wallet className="h-5 w-5" />}
          label="مدفوعات بانتظار المراجعة"
          value={pendingPaymentsCount}
          tint="from-amber-100/60 to-amber-50/40"
          iconColor="text-amber-600"
        />
        <StatCard
          icon={<BookCopy className="h-5 w-5" />}
          label="دوراتي المنشورة"
          value={coursesCount}
          tint="from-[#0A9ED9]/10 to-[#0A9ED9]/5"
          iconColor="text-[#0A9ED9]"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="إجمالي الإيرادات"
          value={Number(totalRevenue._sum.amount || 0)}
          tint="from-[#D65221]/10 to-[#D65221]/5"
          iconColor="text-[#D65221]"
          isCurrency
        />
      </div>

      {/* Quick actions */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="rounded-2xl border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <QuickAction
              href="/instructor/payments"
              icon={<Wallet className="h-4 w-4" />}
              title="مراجعة المدفوعات"
              hint={`${pendingPaymentsCount} إيصال بانتظارك`}
              highlight={pendingPaymentsCount > 0}
            />
            <QuickAction
              href="/instructor/courses"
              icon={<BookCopy className="h-4 w-4" />}
              title="بناء دورة جديدة"
              hint="استخدم محرر السحب والإفلات"
            />
            <QuickAction
              href="/instructor/critiques"
              icon={<Image className="h-4 w-4" />}
              title="نقد أعمال الطلاب"
              hint="علّق على الصور بالـ Pin"
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">آخر الإيرادات</CardTitle>
            <Link
              href="/instructor/analytics"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              التفاصيل
              <ArrowLeft className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Number(totalRevenue._sum.amount || 0).toLocaleString("ar-SA")}{" "}
              <span className="text-base font-medium text-muted-foreground">ر.س</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              إجمالي المدفوعات المعتمدة لجميع دوراتك
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Students needing attention */}
      <StudentsNeedingAttention instructorId={session.user.id} role={session.user.role} />
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
          {isCurrency ? value.toLocaleString("ar-SA") : value}
        </div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
      </CardContent>
    </Card>
  );
}

function QuickAction({
  href,
  icon,
  title,
  hint,
  highlight,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  hint: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 transition-colors group"
    >
      <div
        className={`h-9 w-9 rounded-lg flex items-center justify-center ${
          highlight ? "bg-amber-100 text-amber-700" : "bg-muted/60 text-muted-foreground"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
      {highlight && (
        <Badge className="bg-[#D65221] text-white hover:bg-[#D65221]/80">
          جديد
        </Badge>
      )}
      <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
    </Link>
  );
}
