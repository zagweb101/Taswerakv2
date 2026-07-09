import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  Wallet,
  TrendingUp,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Banknote,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { PaymentStatusBadge } from "@/components/dashboard/status-badges";
import { ExportExcelButton } from "@/components/admin/export-excel-button";

export const dynamic = "force-dynamic";

const mockPayments = [
  { id: "p1", amount: 899, currency: "SAR", status: "APPROVED", bankName: "البنك الأهلي", referenceNumber: "TRX-001", createdAt: new Date("2026-07-08"), student: { name: "صفاء العتيبي" }, enrollment: { course: { titleAr: "تصوير البيوتي" } } },
  { id: "p2", amount: 599, currency: "SAR", status: "APPROVED", bankName: "بنك الراجحي", referenceNumber: "TRX-002", createdAt: new Date("2026-07-08"), student: { name: "أماني بخش" }, enrollment: { course: { titleAr: "ميكب توتوريال" } } },
  { id: "p3", amount: 499, currency: "SAR", status: "PENDING", bankName: "بنك الإنماء", referenceNumber: "TRX-003", createdAt: new Date("2026-07-09"), student: { name: "نورة القحطاني" }, enrollment: { course: { titleAr: "أساسيات التصوير" } } },
  { id: "p4", amount: 899, currency: "SAR", status: "APPROVED", bankName: "البنك الأهلي", referenceNumber: "TRX-004", createdAt: new Date("2026-07-07"), student: { name: "المها اليازيدي" }, enrollment: { course: { titleAr: "تصوير البيوتي" } } },
  { id: "p5", amount: 499, currency: "SAR", status: "REJECTED", bankName: "بنك الراجحي", referenceNumber: "TRX-005", createdAt: new Date("2026-07-06"), student: { name: "ريم العنزي" }, enrollment: { course: { titleAr: "أساسيات التصوير" } } },
];

export default async function AdminFinancePage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  let payments: any[] = [];
  let stats = { total: 0, approved: 0, pending: 0, rejected: 0 };
  try {
    payments = await db.paymentReceipt.findMany({
      include: {
        student: { select: { name: true } },
        enrollment: { select: { course: { select: { titleAr: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    const [total, approved, pending, rejected] = await Promise.all([
      db.paymentReceipt.aggregate({ _sum: { amount: true } }),
      db.paymentReceipt.aggregate({ where: { status: "APPROVED" }, _sum: { amount: true } }),
      db.paymentReceipt.aggregate({ where: { status: "PENDING" }, _sum: { amount: true } }),
      db.paymentReceipt.aggregate({ where: { status: "REJECTED" }, _sum: { amount: true } }),
    ]);
    stats = {
      total: Number(total._sum.amount || 0),
      approved: Number(approved._sum.amount || 0),
      pending: Number(pending._sum.amount || 0),
      rejected: Number(rejected._sum.amount || 0),
    };
  } catch {
    payments = mockPayments;
    stats = { total: 3395, approved: 2397, pending: 499, rejected: 499 };
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="المالية"
        description="تتبّع كل المدفوعات وصِدْقها وتصدير التقارير"
        actions={<ExportExcelButton />}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="rounded-2xl border-[#D65221]/30 bg-[#D65221]/5">
          <CardContent className="p-4">
            <Wallet className="h-5 w-5 mb-2 text-[#D65221]" />
            <div className="text-2xl font-bold">{stats.total.toLocaleString("ar-SA")}</div>
            <div className="text-xs text-muted-foreground">إجمالي (ر.س)</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-emerald-200/60 bg-emerald-50/40">
          <CardContent className="p-4">
            <CheckCircle2 className="h-5 w-5 mb-2 text-emerald-600" />
            <div className="text-2xl font-bold text-emerald-700">{stats.approved.toLocaleString("ar-SA")}</div>
            <div className="text-xs text-muted-foreground">معتمد (ر.س)</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-amber-200/60 bg-amber-50/40">
          <CardContent className="p-4">
            <Clock className="h-5 w-5 mb-2 text-amber-600" />
            <div className="text-2xl font-bold text-amber-700">{stats.pending.toLocaleString("ar-SA")}</div>
            <div className="text-xs text-muted-foreground">قيد المراجعة (ر.س)</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-red-200/60 bg-red-50/40">
          <CardContent className="p-4">
            <TrendingUp className="h-5 w-5 mb-2 text-red-600" />
            <div className="text-2xl font-bold text-red-700">{stats.rejected.toLocaleString("ar-SA")}</div>
            <div className="text-xs text-muted-foreground">مرفوض (ر.س)</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">آخر المعاملات</CardTitle>
              <CardDescription>أحدث {payments.length} معاملة</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl">
              <Filter className="h-3.5 w-3.5 ml-1" />
              تصفية
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground">
              لا توجد معاملات بعد
            </div>
          ) : (
            <div className="overflow-x-auto nice-scroll">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-right text-xs text-muted-foreground border-b border-border/60">
                    <th className="font-medium py-2 px-2">الطالب</th>
                    <th className="font-medium py-2 px-2 hidden sm:table-cell">الدورة</th>
                    <th className="font-medium py-2 px-2 hidden md:table-cell">البنك</th>
                    <th className="font-medium py-2 px-2">المبلغ</th>
                    <th className="font-medium py-2 px-2">الحالة</th>
                    <th className="font-medium py-2 px-2 hidden lg:table-cell">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-2">
                        <div className="font-medium">{p.student?.name || "—"}</div>
                        <div className="text-xs text-muted-foreground" dir="ltr">{p.referenceNumber || "—"}</div>
                      </td>
                      <td className="py-3 px-2 hidden sm:table-cell text-xs">
                        {p.enrollment?.course?.titleAr || "—"}
                      </td>
                      <td className="py-3 px-2 hidden md:table-cell text-xs text-muted-foreground">
                        {p.bankName}
                      </td>
                      <td className="py-3 px-2 font-semibold">
                        {Number(p.amount).toLocaleString("ar-SA")} <span className="text-xs text-muted-foreground">{p.currency}</span>
                      </td>
                      <td className="py-3 px-2">
                        <PaymentStatusBadge status={p.status} />
                      </td>
                      <td className="py-3 px-2 hidden lg:table-cell text-xs text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString("ar-SA")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="rounded-2xl border-border/60">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-lg bg-[#00A3AA]/15 flex items-center justify-center">
              <Banknote className="h-4 w-4 text-[#00A3AA]" />
            </div>
            <div>
              <div className="font-semibold">ملخص الإيرادات</div>
              <div className="text-xs text-muted-foreground">يُحسب فقط من المدفوعات المعتمدة</div>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-muted/30">
              <div className="text-xs text-muted-foreground">حصة المنصة (10%)</div>
              <div className="text-lg font-bold mt-1">
                {(stats.approved * 0.1).toLocaleString("ar-SA", { maximumFractionDigits: 0 })} ر.س
              </div>
            </div>
            <div className="p-3 rounded-xl bg-muted/30">
              <div className="text-xs text-muted-foreground">حصة المدرّبين (90%)</div>
              <div className="text-lg font-bold mt-1">
                {(stats.approved * 0.9).toLocaleString("ar-SA", { maximumFractionDigits: 0 })} ر.س
              </div>
            </div>
            <div className="p-3 rounded-xl bg-muted/30">
              <div className="text-xs text-muted-foreground">عدد المعاملات المعتمدة</div>
              <div className="text-lg font-bold mt-1">
                {payments.filter((p) => p.status === "APPROVED").length.toLocaleString("ar-SA")}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
