"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaymentStatusBadge } from "@/components/dashboard/status-badges";

interface Payment {
  id: string;
  amount: any;
  currency: string;
  status: string;
  bankName: string;
  referenceNumber: string | null;
  createdAt: Date;
  student: { name: string | null };
  enrollment: { course: { titleAr: string | null; title: string } } | null;
}

export function FinanceTransactionsTable({ payments }: { payments: Payment[] }) {
  const [q, setQ] = useState("");

  const filtered = q
    ? payments.filter((p) => {
        const term = q.toLowerCase().trim();
        return (
          (p.student?.name || "").toLowerCase().includes(term) ||
          (p.referenceNumber || "").toLowerCase().includes(term) ||
          (p.bankName || "").toLowerCase().includes(term) ||
          (p.enrollment?.course?.titleAr || p.enrollment?.course?.title || "")
            .toLowerCase()
            .includes(term)
        );
      })
    : payments;

  return (
    <Card className="rounded-2xl border-border/60">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">آخر المعاملات</CardTitle>
            <CardDescription>
              {filtered.length.toLocaleString("ar-SA")} من{" "}
              {payments.length.toLocaleString("ar-SA")} معاملة
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ابحث بالاسم، المرجع، البنك، الدورة..."
                className="pr-10 rounded-xl"
              />
            </div>
            <Button variant="outline" size="sm" className="rounded-xl shrink-0">
              <Filter className="h-3.5 w-3.5 ml-1" />
              تصفية
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-sm text-muted-foreground">
            {payments.length === 0
              ? "لا توجد معاملات بعد"
              : `لا توجد نتائج للبحث "${q}"`}
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
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-2">
                      <div className="font-medium">{p.student?.name || "—"}</div>
                      <div className="text-xs text-muted-foreground" dir="ltr">
                        {p.referenceNumber || "—"}
                      </div>
                    </td>
                    <td className="py-3 px-2 hidden sm:table-cell text-xs">
                      {p.enrollment?.course?.titleAr || p.enrollment?.course?.title || "—"}
                    </td>
                    <td className="py-3 px-2 hidden md:table-cell text-xs text-muted-foreground">
                      {p.bankName}
                    </td>
                    <td className="py-3 px-2 font-semibold">
                      {Number(p.amount).toLocaleString("ar-SA")}{" "}
                      <span className="text-xs text-muted-foreground">{p.currency}</span>
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
  );
}
