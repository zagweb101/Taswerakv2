"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Loader2, Ticket, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  validFrom: string;
  validUntil: string | null;
  maxUses: number;
  usedCount: number;
  courseId: string | null;
  isActive: boolean;
}

export function CouponsManager({ initialCoupons, dbError }: { initialCoupons: Coupon[]; dbError: boolean }) {
  const [pending, startTransition] = useTransition();
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    code: "",
    type: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    value: "20",
    validUntil: "",
    maxUses: "100",
    courseId: "",
    isActive: true,
  });

  const create = () => {
    if (!form.code || !form.value) {
      toast.error("الكود والقيمة مطلوبان");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: form.code,
            type: form.type,
            value: Number(form.value),
            validUntil: form.validUntil || null,
            maxUses: Number(form.maxUses),
            courseId: form.courseId || null,
            isActive: form.isActive,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || "فشل الإنشاء");
        setCoupons([data.coupon, ...coupons]);
        toast.success(data.message);
        setCreateOpen(false);
        setForm({ code: "", type: "PERCENTAGE", value: "20", validUntil: "", maxUses: "100", courseId: "", isActive: true });
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  const toggle = (id: string, isActive: boolean) => {
    startTransition(async () => {
      // Optimistic
      setCoupons(coupons.map((c) => c.id === id ? { ...c, isActive: !isActive } : c));
      // TODO: real API call
      toast.success(isActive ? "تم إيقاف الكوبون" : "تم تفعيل الكوبون");
    });
  };

  const remove = (id: string) => {
    if (!confirm("حذف هذا الكوبون؟")) return;
    setCoupons(coupons.filter((c) => c.id !== id));
    toast.success("تم حذف الكوبون");
  };

  if (dbError) {
    return (
      <Card className="rounded-2xl border-border/60">
        <CardContent className="p-6 text-center text-muted-foreground">
          تعذّر تحميل الكوبونات — تحقق من اتصال قاعدة البيانات
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Create button */}
      <div className="flex justify-end">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl brand-gradient text-white hover:opacity-90">
              <Plus className="h-4 w-4 ml-1" /> كوبون جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إنشاء كوبون جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">كود الكوبون *</Label>
                <Input
                  id="code"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="RAMADAN20"
                  className="rounded-xl font-mono"
                  dir="ltr"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>النوع</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as any })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">نسبة مئوية %</SelectItem>
                      <SelectItem value="FIXED">مبلغ ثابت (ر.س)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">القيمة *</Label>
                  <Input
                    id="value"
                    type="number"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    className="rounded-xl"
                    placeholder={form.type === "PERCENTAGE" ? "20" : "100"}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="validUntil">تاريخ الانتهاء</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={form.validUntil}
                    onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxUses">الحد الأقصى للاستخدام</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    value={form.maxUses}
                    onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="courseId">لدورة محددة (اختياري)</Label>
                <Input
                  id="courseId"
                  value={form.courseId}
                  onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                  placeholder="اتركه فارغاً لكل الدورات"
                  className="rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" onClick={() => setCreateOpen(false)} className="rounded-xl">إلغاء</Button>
                <Button onClick={create} disabled={pending} className="rounded-xl brand-gradient text-white">
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 ml-1" />}
                  إنشاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Coupons list */}
      {coupons.length === 0 ? (
        <Card className="rounded-2xl border-border/60">
          <CardContent className="p-10 text-center">
            <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="font-semibold mb-1">لا توجد كوبونات بعد</p>
            <p className="text-sm text-muted-foreground">أنشئ كوبون خصم لأول عرض تسويقي لك</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {coupons.map((c) => {
            const expired = c.validUntil && new Date(c.validUntil) < new Date();
            const usedUp = c.usedCount >= c.maxUses;
            return (
              <Card key={c.id} className="rounded-2xl border-border/60">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-lg" dir="ltr">{c.code}</span>
                        {c.isActive && !expired && !usedUp ? (
                          <Badge className="bg-emerald-100 text-emerald-700"><CheckCircle2 className="h-3 w-3 ml-1" />نشط</Badge>
                        ) : (
                          <Badge className="bg-zinc-100 text-zinc-600"><XCircle className="h-3 w-3 ml-1" />{expired ? "منتهي" : usedUp ? "مستخدم بالكامل" : "متوقف"}</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {c.type === "PERCENTAGE" ? `${c.value}% خصم` : `${c.value} ر.س خصم`}
                      </div>
                    </div>
                    <button onClick={() => remove(c.id)} className="text-red-600 hover:bg-red-50 h-8 w-8 rounded-lg flex items-center justify-center">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">الاستخدام</div>
                      <div className="font-medium">{c.usedCount}/{c.maxUses}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">البداية</div>
                      <div className="font-medium">{new Date(c.validFrom).toLocaleDateString("ar-SA")}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">النهاية</div>
                      <div className="font-medium">{c.validUntil ? new Date(c.validUntil).toLocaleDateString("ar-SA") : "—"}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/40">
                    <span className="text-xs text-muted-foreground">تفعيل</span>
                    <Switch checked={c.isActive} onCheckedChange={() => toggle(c.id, c.isActive)} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
