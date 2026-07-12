import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Filter,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { DashboardEmptyState } from "@/components/dashboard/empty-state";
import { PaymentStatusBadge } from "@/components/dashboard/status-badges";
import { PaymentReviewCard } from "@/components/instructor/payment-review-card";

export const dynamic = "force-dynamic";

const mockReceipts = [
  {
    id: "pr1",
    imageUrl: "",
    bankName: "بنك الراجحي",
    amount: 899,
    currency: "SAR",
    referenceNumber: "TRX-2026-102",
    status: "PENDING",
    notes: "تحويل عبر تطبيق الراجحي",
    createdAt: new Date("2026-07-09T11:00:00"),
    student: {
      id: "s1",
      name: "صفاء العتيبي",
      email: "safaa@example.com",
    },
    enrollment: {
      course: { titleAr: "تصوير البيوتي Beauty", title: "Beauty" },
    },
  },
  {
    id: "pr2",
    imageUrl: "",
    bankName: "البنك الأهلي",
    amount: 499,
    currency: "SAR",
    referenceNumber: "TRX-2026-103",
    status: "PENDING",
    notes: null,
    createdAt: new Date("2026-07-09T09:30:00"),
    student: {
      id: "s2",
      name: "نورة القحطاني",
      email: "noura@example.com",
    },
    enrollment: {
      course: { titleAr: "أساسيات التصوير", title: "Fundamentals" },
    },
  },
  {
    id: "pr3",
    imageUrl: "",
    bankName: "بنك الإنماء",
    amount: 599,
    currency: "SAR",
    referenceNumber: "TRX-2026-098",
    status: "APPROVED",
    notes: null,
    createdAt: new Date("2026-07-08T15:00:00"),
    reviewedAt: new Date("2026-07-08T16:00:00"),
    student: {
      id: "s3",
      name: "أماني بخش",
      email: "amani@example.com",
    },
    enrollment: {
      course: { titleAr: "ميكب توتوريال", title: "Makeup" },
    },
  },
];

export default async function InstructorPaymentsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const receipts = await db.paymentReceipt.findMany({
    where: {
      enrollment: { course: { instructorId: session.user.id } },
    },
    include: {
      student: { select: { id: true, name: true, email: true, image: true } },
      enrollment: {
        select: { course: { select: { titleAr: true, title: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const pending = receipts.filter((r) => r.status === "PENDING");
  const approved = receipts.filter((r) => r.status === "APPROVED");
  const rejected = receipts.filter((r) => r.status === "REJECTED");
  const totalRevenue = approved.reduce((sum, r) => sum + Number(r.amount), 0);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="صندوق المدفوعات"
        description="راجع إيصالات الطلاب واعتمدها أو ارفضها"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="rounded-2xl border-amber-200/60 bg-amber-50/40">
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 mx-auto text-amber-600 mb-1" />
            <div className="text-2xl font-bold text-amber-600">{pending.length}</div>
            <div className="text-xs text-muted-foreground">بانتظار المراجعة</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-emerald-200/60 bg-emerald-50/40">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-5 w-5 mx-auto text-emerald-600 mb-1" />
            <div className="text-2xl font-bold text-emerald-600">{approved.length}</div>
            <div className="text-xs text-muted-foreground">معتمد</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-red-200/60 bg-red-50/40">
          <CardContent className="p-4 text-center">
            <XCircle className="h-5 w-5 mx-auto text-red-600 mb-1" />
            <div className="text-2xl font-bold text-red-600">{rejected.length}</div>
            <div className="text-xs text-muted-foreground">مرفوض</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-[#D65221]/30 bg-[#D65221]/5">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-[#D65221] mb-1" />
            <div className="text-2xl font-bold text-[#D65221]">
              {totalRevenue.toLocaleString("ar-SA")}
            </div>
            <div className="text-xs text-muted-foreground">إجمالي الإيرادات ر.س</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending section */}
      {pending.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            بانتظار قرارك ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map((r) => (
              <PaymentReviewCard key={r.id} receipt={r} />
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {approved.length + rejected.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            السجل ({approved.length + rejected.length})
          </h2>
          <div className="space-y-3">
            {[...approved, ...rejected].map((r) => (
              <Card key={r.id} className="rounded-2xl border-border/60 opacity-90">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg brand-gradient-soft border border-border/40 flex items-center justify-center shrink-0">
                      <Wallet className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold">{r.student.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {r.enrollment?.course?.titleAr || r.enrollment?.course?.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {Number(r.amount).toLocaleString("ar-SA")} {r.currency} · {r.bankName} · {new Date(r.createdAt).toLocaleDateString("ar-SA")}
                      </div>
                    </div>
                    <PaymentStatusBadge status={r.status} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty */}
      {receipts.length === 0 && (
        <Card className="rounded-2xl border-border/60">
          <CardContent>
            <DashboardEmptyState
              icon={<Wallet className="h-6 w-6" />}
              title="لا توجد مدفوعات بعد"
              hint="ستظهر هنا إيصالات الطلاب فور رفعها"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
