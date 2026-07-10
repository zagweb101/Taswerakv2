"use client";

import { useState, useTransition } from "react";
import { Download, Loader2, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ExportExcelButton() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [range, setRange] = useState("THIS_MONTH");
  const [status, setStatus] = useState("ALL");

  const doExport = () => {
    startTransition(async () => {
      try {
        const url = `/api/admin/finance/export?range=${range}&status=${status}`;
        const res = await fetch(url);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "فشل التصدير");
        }
        // Trigger download
        const blob = await res.blob();
        const dlUrl = URL.createObjectURL(blob);
        const a = window.document.createElement("a");
        a.href = dlUrl;
        a.download = `taswerak-finance-${range}-${status}-${new Date().toISOString().slice(0, 10)}.xlsx`;
        window.document.body.appendChild(a);
        a.click();
        window.document.body.removeChild(a);
        URL.revokeObjectURL(dlUrl);

        toast.success("تم تصدير ملف Excel بنجاح");
        setOpen(false);
      } catch (err: any) {
        toast.error(err.message || "فشل التصدير");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl brand-gradient text-white hover:opacity-90">
          <Download className="h-4 w-4 ml-1" />
          تصدير Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-[#00A3AA]" />
            تصدير تقرير المالية
          </DialogTitle>
          <DialogDescription>
            اختر النطاق الزمني وحالة المعاملات لتصديرها في ملف Excel
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>النطاق الزمني</Label>
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="THIS_WEEK">هذا الأسبوع</SelectItem>
                <SelectItem value="THIS_MONTH">هذا الشهر</SelectItem>
                <SelectItem value="LAST_MONTH">الشهر الماضي</SelectItem>
                <SelectItem value="THIS_QUARTER">هذا الربع</SelectItem>
                <SelectItem value="THIS_YEAR">هذا العام</SelectItem>
                <SelectItem value="ALL">كل الفترات</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>حالة المعاملات</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">كل الحالات</SelectItem>
                <SelectItem value="APPROVED">معتمدة فقط</SelectItem>
                <SelectItem value="PENDING">قيد المراجعة</SelectItem>
                <SelectItem value="REJECTED">مرفوضة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 text-xs">
            <div className="font-medium mb-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-[#00A3AA]" />
              سيحتوي الملف على:
            </div>
            <ul className="text-muted-foreground space-y-0.5">
              <li>• اسم الطالب + بريده</li>
              <li>• اسم الدورة + المدرّب</li>
              <li>• المبلغ + البنك + رقم المرجع</li>
              <li>• الحالة + التاريخ</li>
              <li>• ملخص الإيرادات في ورقة منفصلة</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-xl flex-1"
              onClick={() => setOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              className="rounded-xl brand-gradient text-white hover:opacity-90 flex-1"
              disabled={pending}
              onClick={doExport}
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-1" /> جارٍ التصدير...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 ml-1" /> تصدير الآن
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
