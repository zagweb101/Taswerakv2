"use client";

import { useState, useTransition } from "react";
import { Upload, Loader2, X, FileImage } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function UploadReceiptDialog() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    courseId: "",
    bankName: "البنك الأهلي السعودي",
    amount: "",
    referenceNumber: "",
    notes: "",
  });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("الملف يجب أن يكون صورة");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن لا يتجاوز 5 ميجابايت");
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("الرجاء رفع صورة الإيصال");
      return;
    }
    startTransition(async () => {
      await new Promise((r) => setTimeout(r, 800));
      toast.success("تم رفع الإيصال بنجاح! سيتم مراجعته من المدرّب.");
      setOpen(false);
      setFile(null);
      setPreview(null);
      setForm({
        courseId: "",
        bankName: "البنك الأهلي السعودي",
        amount: "",
        referenceNumber: "",
        notes: "",
      });
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl brand-gradient text-white hover:opacity-90">
          <Upload className="h-4 w-4 ml-1" />
          رفع إيصال جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto nice-scroll">
        <DialogHeader>
          <DialogTitle>رفع إيصال تحويل بنكي</DialogTitle>
          <DialogDescription>
            ارفع صورة واضحة لإيصال التحويل. سيتم مراجعته من المدرّب خلال 24 ساعة.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* File upload */}
          <div className="space-y-2">
            <Label>صورة الإيصال *</Label>
            {preview ? (
              <div className="relative rounded-xl overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="معاينة الإيصال" className="w-full max-h-64 object-contain bg-muted/30" />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                  className="absolute top-2 left-2 h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70"
                  aria-label="إزالة"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 p-8 rounded-xl border-2 border-dashed border-border hover:border-[#0A9ED9]/40 hover:bg-[#0A9ED9]/5 cursor-pointer transition-colors">
                <FileImage className="h-10 w-10 text-muted-foreground" />
                <span className="text-sm font-medium">انقر لاختيار صورة</span>
                <span className="text-xs text-muted-foreground">PNG أو JPG، حتى 5 ميجابايت</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className="sr-only"
                />
              </label>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bank">اسم البنك *</Label>
              <Input
                id="bank"
                required
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">المبلغ المحوّل (ر.س) *</Label>
              <Input
                id="amount"
                type="number"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="rounded-xl"
                placeholder="899"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="ref">رقم المرجع</Label>
              <Input
                id="ref"
                value={form.referenceNumber}
                onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })}
                className="rounded-xl"
                dir="ltr"
                placeholder="TRX-XXXXXXX"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="rounded-xl min-h-[80px]"
                placeholder="أي تفاصيل إضافية للمدرّب..."
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl flex-1"
              onClick={() => setOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="rounded-xl brand-gradient text-white hover:opacity-90 flex-1"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-1" /> جارٍ الرفع...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 ml-1" /> إرسال للمراجعة
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
