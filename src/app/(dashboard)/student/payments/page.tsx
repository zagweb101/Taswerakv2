import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ReceiptText, Upload, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { DashboardEmptyState } from "@/components/dashboard/empty-state";
import { PaymentStatusBadge } from "@/components/dashboard/status-badges";
import { UploadReceiptDialog } from "@/components/student/upload-receipt-dialog";

export const dynamic = "force-dynamic";

const mockReceipts = [
  {
    id: "r1",
    imageUrl: "",
    bankName: "البنك الأهلي السعودي",
    amount: 899,
    currency: "SAR",
    referenceNumber: "TRX-2026-001",
    status: "APPROVED",
    notes: null,
    rejectionReason: null,
    createdAt: new Date("2026-06-01"),
    reviewedAt: new Date("2026-06-02"),
    enrollment: {
      course: { titleAr: "تصوير البيوتي Beauty", title: "Beauty" },
    },
  },
  {
    id: "r2",
    imageUrl: "",
    bankName: "بنك الراجحي",
    amount: 599,
    currency: "SAR",
    referenceNumber: "TRX-2026-002",
    status: "PENDING",
    notes: null,
    rejectionReason: null,
    createdAt: new Date("2026-07-09"),
    reviewedAt: null,
    enrollment: {
      course: { titleAr: "ميكب توتوريال", title: "Makeup" },
    },
  },
];

export default async function StudentPaymentsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  let receipts: any[] = [];
  try {
    receipts = await db.paymentReceipt.findMany({
      where: { studentId: session.user.id },
      include: {
        enrollment: {
          select: { course: { select: { titleAr: true, title: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    receipts = mockReceipts;
  }

  const pending = receipts.filter((r) => r.status === "PENDING");
  const approved = receipts.filter((r) => r.status === "APPROVED");
  const rejected = receipts.filter((r) => r.status === "REJECTED");

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="إيصالات الدفع"
        description="ارفع إيصالات التحويل البنكي وتابع حالة اعتمادها"
        actions={<UploadReceiptDialog />}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="rounded-2xl border-border/40 bg-amber-50/40">
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 mx-auto text-amber-600 mb-1" />
            <div className="text-2xl font-bold text-amber-600">{pending.length}</div>
            <div className="text-xs text-muted-foreground">قيد المراجعة</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/40 bg-emerald-50/40">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-5 w-5 mx-auto text-emerald-600 mb-1" />
            <div className="text-2xl font-bold text-emerald-600">{approved.length}</div>
            <div className="text-xs text-muted-foreground">معتمد</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/40 bg-red-50/40">
          <CardContent className="p-4 text-center">
            <XCircle className="h-5 w-5 mx-auto text-red-600 mb-1" />
            <div className="text-2xl font-bold text-red-600">{rejected.length}</div>
            <div className="text-xs text-muted-foreground">مرفوض</div>
          </CardContent>
        </Card>
      </div>

      {/* Bank details banner */}
      <Card className="rounded-2xl border-[#00A3AA]/30 bg-[#00A3AA]/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#00A3AA]/15 flex items-center justify-center shrink-0">
              <ReceiptText className="h-4 w-4 text-[#00A3AA]" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">بيانات الحساب للتحويل</div>
              <div className="mt-2 grid sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">البنك</div>
                  <div className="font-medium">البنك الأهلي السعودي</div>
                </div>
                <div>
                  <div className="text-muted-foreground">اسم صاحب الحساب</div>
                  <div className="font-medium">أحمد زغلول - تصويرك</div>
                </div>
                <div>
                  <div className="text-muted-foreground">IBAN</div>
                  <div className="font-medium tracking-wider" dir="ltr">SA00 0000 0000 0000 0000</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receipts list */}
      {receipts.length === 0 ? (
        <Card className="rounded-2xl border-border/60">
          <CardContent>
            <DashboardEmptyState
              icon={<Upload className="h-6 w-6" />}
              title="لا توجد إيصالات بعد"
              hint="بعد التسجيل في دورة، ارفع إيصال التحويل البنكي هنا لاعتماده"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {receipts.map((r) => (
            <Card key={r.id} className="rounded-2xl border-border/60">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Receipt thumbnail */}
                  <div className="h-20 w-20 rounded-xl brand-gradient-soft border border-border/40 flex items-center justify-center shrink-0">
                    <ReceiptText className="h-8 w-8 text-muted-foreground" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="font-semibold">
                        {r.enrollment?.course?.titleAr || r.enrollment?.course?.title || "دورة"}
                      </div>
                      <PaymentStatusBadge status={r.status} />
                    </div>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <div className="text-muted-foreground">البنك</div>
                        <div className="font-medium">{r.bankName}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">المبلغ</div>
                        <div className="font-medium">
                          {Number(r.amount).toLocaleString("ar-SA")} {r.currency}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">رقم المرجع</div>
                        <div className="font-medium tracking-wider" dir="ltr">{r.referenceNumber || "—"}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">التاريخ</div>
                        <div className="font-medium">{new Date(r.createdAt).toLocaleDateString("ar-SA")}</div>
                      </div>
                    </div>

                    {/* Rejection reason */}
                    {r.status === "REJECTED" && r.rejectionReason && (
                      <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                        <span className="font-semibold">سبب الرفض: </span>
                        {r.rejectionReason}
                      </div>
                    )}

                    {/* Notes */}
                    {r.notes && (
                      <div className="mt-3 p-3 rounded-xl bg-muted/40 text-xs">
                        <span className="font-semibold">ملاحظات: </span>
                        {r.notes}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
