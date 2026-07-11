"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, X, FileImage, CheckCircle2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Course {
  id: string;
  titleAr: string | null;
  title: string;
  price: number | string;
  currency: string;
}

export function UploadReceiptDialog({ courses }: { courses?: Course[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    courseId: "",
    bankName: "البنك الأهلي السعودي",
    amount: "",
    referenceNumber: "",
    notes: "",
  });

  // Default fallback courses when not provided
  const availableCourses: Course[] = courses || [
    { id: "c1", titleAr: "أساسيات التصوير", title: "Fundamentals", price: 499, currency: "SAR" },
    { id: "c2", titleAr: "تصوير البيوتي Beauty", title: "Beauty", price: 899, currency: "SAR" },
    { id: "c3", titleAr: "ميكب توتوريال", title: "Makeup", price: 599, currency: "SAR" },
  ];

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
    if (!form.courseId) {
      toast.error("اختر الدورة");
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error("أدخل المبلغ الصحيح");
      return;
    }

    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.append("receipt", file);
        fd.append(
          "metadata",
          JSON.stringify({
            courseId: form.courseId,
            bankName: form.bankName,
            amount: form.amount,
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
          throw new Error(data.error || "فشل الرفع");
        }

        setSuccess(true);
        toast.success("تم رفع الإيصال بنجاح! سيتم مراجعته من المدرّب خلال 24 ساعة.");
        setTimeout(() => {
          setOpen(false);
          setFile(null);
          setPreview(null);
          setSuccess(false);
          setForm({
            courseId: "",
            bankName: "البنك الأهلي السعودي",
            amount: "",
            referenceNumber: "",
            notes: "",
          });
          // Refresh server data
          router.refresh();
        }, 1500);
      } catch (err: any) {
        toast.error(err.message || "فشل رفع الإيصال");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSuccess(false); }}>
      <DialogTrigger asChild>
        <Button className="rounded-xl brand-gradient text-white hover:opacity-90">
          <Upload className="h-4 w-4 ml-1" />
          رفع إيصال جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto nice-scroll">
        {success ? (
          <div className="py-10 text-center">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-3">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <p className="font-semibold">تم رفع الإيصال بنجاح</p>
            <p className="text-sm text-muted-foreground mt-1">
              سيتم إشعارك بالبريد فور اعتماده من المدرّب
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>رفع إيصال تحويل بنكي</DialogTitle>
              <DialogDescription>
                ارفع صورة واضحة لإيصال التحويل. سيتم مراجعته من المدرّب خلال 24 ساعة.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={onSubmit} className="space-y-4">
              {/* Course select */}
              <div className="space-y-2">
                <Label>الدورة *</Label>
                <Select value={form.courseId} onValueChange={(v) => setForm({ ...form, courseId: v })}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="اختر الدورة" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCourses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.titleAr || c.title} — {Number(c.price).toLocaleString("ar-SA")} {c.currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File upload */}
              <div className="space-y-2">
                <Label>صورة الإيصال *</Label>
                {preview ? (
                  <div className="relative rounded-xl overflow-hidden border border-border">
                    { }
                    <img src={preview} alt="معاينة الإيصال" className="w-full max-h-64 object-contain bg-muted/30" />
                    <button
                      type="button"
                      onClick={() => { setFile(null); setPreview(null); }}
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
                    <span className="text-xs text-muted-foreground">JPG أو PNG أو WebP، حتى 5 ميجابايت</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
