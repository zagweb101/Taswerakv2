"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  Calendar,
  Banknote,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PaymentStatusBadge } from "@/components/dashboard/status-badges";

interface Receipt {
  id: string;
  imageUrl: string;
  bankName: string;
  amount: number | string;
  currency: string;
  referenceNumber: string | null;
  status: string;
  notes: string | null;
  createdAt: Date;
  student: { id: string; name: string | null; email: string };
  enrollment: { course: { titleAr: string | null; title: string } };
}

export function PaymentReviewCard({ receipt }: { receipt: Receipt }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  const decide = (action: "APPROVE" | "REJECT") => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/instructor/payments/${receipt.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            action === "APPROVE"
              ? { action }
              : { action, rejectionReason: reason }
          ),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error || "فشل الإجراء");
        }

        if (action === "APPROVE") {
          toast.success(`تم اعتماد دفعة ${receipt.student.name || "الطالب"}`);
        } else {
          toast.success("تم رفض الدفعة وإشعار الطالب");
          setRejectOpen(false);
          setReason("");
        }
        router.refresh();
      } catch (err: any) {
        toast.error(err.message || "فشل الإجراء");
      }
    });
  };

  return (
    <Card className="rounded-2xl border-amber-200/60 bg-amber-50/30">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Student avatar */}
          <div className="h-14 w-14 rounded-2xl brand-gradient flex items-center justify-center text-white font-bold text-lg shrink-0">
            {(receipt.student.name || "؟").charAt(0)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="font-semibold">{receipt.student.name || "طالب"}</div>
              <PaymentStatusBadge status={receipt.status} />
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">
              {receipt.enrollment?.course?.titleAr || receipt.enrollment?.course?.title}
            </div>

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <div className="text-muted-foreground flex items-center gap-1">
                  <Banknote className="h-3 w-3" /> المبلغ
                </div>
                <div className="font-semibold mt-0.5">
                  {Number(receipt.amount).toLocaleString("ar-SA")} {receipt.currency}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">البنك</div>
                <div className="font-medium mt-0.5">{receipt.bankName}</div>
              </div>
              <div>
                <div className="text-muted-foreground">رقم المرجع</div>
                <div className="font-medium mt-0.5 tracking-wider" dir="ltr">
                  {receipt.referenceNumber || "—"}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> الرفع
                </div>
                <div className="font-medium mt-0.5">{new Date(receipt.createdAt).toLocaleDateString("ar-SA")}</div>
              </div>
            </div>

            {receipt.notes && (
              <div className="mt-3 p-2 rounded-lg bg-muted/40 text-xs">
                <span className="font-semibold">ملاحظات الطالب: </span>
                {receipt.notes}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex sm:flex-col gap-2 sm:w-32">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl flex-1">
                  <Eye className="h-3.5 w-3.5 ml-1" />
                  عرض الإيصال
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>إيصال التحويل — {receipt.student.name}</DialogTitle>
                </DialogHeader>
                <div className="rounded-xl overflow-hidden border border-border bg-muted/30">
                  { }
                  <img loading="lazy"
                    src={receipt.imageUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600'%3E%3Crect width='400' height='600' fill='%23f3f4f6'/%3E%3Ctext x='200' y='300' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%23999'%3Eصورة الإيصال%3C/text%3E%3C/svg%3E"}
                    alt="إيصال"
                    className="w-full max-h-[70vh] object-contain"
                  />
                </div>
              </DialogContent>
            </Dialog>

            <Button
              size="sm"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
              disabled={pending}
              onClick={() => decide("APPROVE")}
            >
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 ml-1" />}
              اعتماد
            </Button>

            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-red-300 text-red-600 hover:bg-red-50 flex-1"
                  disabled={pending}
                >
                  <XCircle className="h-3.5 w-3.5 ml-1" />
                  رفض
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>رفض الإيصال</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="reason">سبب الرفض *</Label>
                    <Textarea
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="rounded-xl min-h-[100px]"
                      placeholder="مثال: المبلغ غير مطابق، الصورة غير واضحة..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="rounded-xl flex-1"
                      onClick={() => setRejectOpen(false)}
                    >
                      إلغاء
                    </Button>
                    <Button
                      className="rounded-xl flex-1 bg-red-600 hover:bg-red-700 text-white"
                      disabled={pending || !reason.trim()}
                      onClick={() => decide("REJECT")}
                    >
                      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                      تأكيد الرفض
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
