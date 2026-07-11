"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, X, FileImage, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  courseId: string;
  courseTitle: string;
  amount: number;
  currency: string;
  studentId: string;
  existingEnrollmentId?: string;
}

export function CheckoutForm({
  courseId,
  courseTitle,
  amount,
  currency,
  studentId,
  existingEnrollmentId,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    bankName: "البنك الأهلي السعودي",
    amountPaid: String(amount),
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
      try {
        const fd = new FormData();
        fd.append("receipt", file);
        fd.append(
          "metadata",
          JSON.stringify({
            courseId,
            bankName: form.bankName,
            amount: form.amountPaid,
            referenceNumber: form.referenceNumber,
            notes: form.notes,
          })
        );

        const res = await fetch("/api/student/payments", {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error || "فشل رفع الإيصال");
        }
        setSuccess(true);
        toast.success("تم رفع الإيصال بنجاح!");
        setTimeout(() => {
          router.push("/student/payments");
        }, 2000);
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  if (success) {
    return (
      <Card className="rounded-2xl border-emerald-200 bg-emerald-50/40">
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="h-16 w-16 mx-auto text-emerald-600 mb-4" />
          <h3 className="font-bold text-lg mb-2">تم رفع إيصالك بنجاح!</h3>
          <p className="text-sm text-muted-foreground mb-4">
            سيقوم المدرّب بمراجعة إيصالك خلال 24 ساعة. ستصل رسالة على بريدك عند الاعتماد.
          </p>
          <p className="text-xs text-muted-foreground">جارٍ تحويلك لصفحة المدفوعات...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-border/60">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Upload className="h-5 w-5 text-[#0A9ED9]" />
          رفع إيصال التحويل
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Image upload */}
          <div className="space-y-2">
            <Label>صورة الإيصال *</Label>
            {preview ? (
              <div className="relative rounded-xl overflow-hidden border border-border">
                { }
                <img src={preview} alt="إيصال" className="w-full max-h-64 object-contain bg-muted/30" />
                <button
                  type="button"
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="absolute top-2 left-2 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center"
                  aria-label="إزالة"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 p-8 rounded-xl border-2 border-dashed border-border hover:border-[#0A9ED9]/40 hover:bg-[#0A9ED9]/5 cursor-pointer transition-colors">
                <FileImage className="h-12 w-12 text-muted-foreground" />
                <span className="text-sm font-medium">انقر لاختيار صورة الإيصال</span>
                <span className="text-xs text-muted-foreground">JPG/PNG/WebP، حتى 5MB</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFileChange} className="sr-only" />
              </label>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bank">البنك الذي حوّلت منه *</Label>
              <Input
                id="bank"
                required
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">المبلغ المحوّل ({currency}) *</Label>
              <Input
                id="amount"
                type="number"
                required
                value={form.amountPaid}
                onChange={(e) => setForm({ ...form, amountPaid: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="ref">رقم المرجع (إن وجد)</Label>
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
              <Label htmlFor="notes">ملاحظات (اختياري)</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="rounded-xl min-h-[60px]"
                placeholder="أي تفاصيل إضافية للمدرّب..."
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl brand-gradient text-white hover:opacity-90 h-12 text-base"
          >
            {pending ? (
              <><Loader2 className="h-4 w-4 animate-spin ml-1" /> جارٍ الإرسال...</>
            ) : (
              <><Upload className="h-4 w-4 ml-1" /> إرسال الإيصال للمراجعة</>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
