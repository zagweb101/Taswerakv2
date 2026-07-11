"use client";

import { useState, useTransition } from "react";
import { Plus, MessageSquare, Loader2, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Ticket {
  id: string;
  subject: string;
  body: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  course?: { titleAr: string | null; title: string } | null;
  _count?: { replies: number };
}

const statusMap: Record<string, { label: string; cls: string }> = {
  OPEN: { label: "مفتوحة", cls: "bg-blue-100 text-blue-700" },
  IN_PROGRESS: { label: "قيد المعالجة", cls: "bg-amber-100 text-amber-700" },
  RESOLVED: { label: "تم الحل", cls: "bg-emerald-100 text-emerald-700" },
  CLOSED: { label: "مغلقة", cls: "bg-zinc-100 text-zinc-600" },
};

const categoryMap: Record<string, string> = {
  GENERAL: "عام",
  TECHNICAL: "تقني",
  PAYMENT: "دفع",
  REFUND: "استرداد",
  OTHER: "أخرى",
};

export function SupportTicketList({ tickets, dbError }: { tickets: Ticket[]; dbError: boolean }) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    body: "",
    category: "GENERAL",
    priority: "NORMAL",
  });

  const create = () => {
    if (!form.subject || !form.body) {
      toast.error("الموضوع والرسالة مطلوبان");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/student/support", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || "فشل الإنشاء");
        toast.success(data.message);
        setOpen(false);
        setForm({ subject: "", body: "", category: "GENERAL", priority: "NORMAL" });
        setTimeout(() => window.location.reload(), 1000);
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  if (dbError) {
    return (
      <Card className="rounded-2xl border-border/60">
        <CardContent className="p-6 text-center text-muted-foreground">
          تعذّر تحميل التذاكر — تحقق من الاتصال
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl brand-gradient text-white hover:opacity-90">
              <Plus className="h-4 w-4 ml-1" /> تذكرة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>فتح تذكرة دعم</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>الموضوع *</Label>
                <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="rounded-xl" placeholder="مشكلة في تشغيل الفيديو" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>التصنيف</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL">عام</SelectItem>
                      <SelectItem value="TECHNICAL">تقني</SelectItem>
                      <SelectItem value="PAYMENT">دفع</SelectItem>
                      <SelectItem value="REFUND">استرداد</SelectItem>
                      <SelectItem value="OTHER">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>الأولوية</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">منخفضة</SelectItem>
                      <SelectItem value="NORMAL">عادية</SelectItem>
                      <SelectItem value="HIGH">عالية</SelectItem>
                      <SelectItem value="URGENT">عاجلة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>الرسالة *</Label>
                <Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="rounded-xl min-h-[120px]" placeholder="اشرح مشكلتك بالتفصيل..." />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">إلغاء</Button>
                <Button onClick={create} disabled={pending} className="rounded-xl brand-gradient text-white">
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 ml-1" />}
                  إرسال
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {tickets.length === 0 ? (
        <Card className="rounded-2xl border-border/60">
          <CardContent className="p-10 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="font-semibold mb-1">لا توجد تذاكر دعم</p>
            <p className="text-sm text-muted-foreground">إذا واجهت أي مشكلة، افتح تذكرة وسنرد عليك</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => {
            const st = statusMap[t.status] || statusMap.OPEN;
            return (
              <Card key={t.id} className="rounded-2xl border-border/60">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{t.subject}</span>
                        <Badge className={st.cls}>{st.label}</Badge>
                        <Badge variant="outline">{categoryMap[t.category] || t.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.body}</p>
                      <div className="text-xs text-muted-foreground mt-2 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(t.createdAt).toLocaleDateString("ar-SA")}
                        </span>
                        {t._count?.replies > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {t._count.replies} رد
                          </span>
                        )}
                      </div>
                    </div>
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
