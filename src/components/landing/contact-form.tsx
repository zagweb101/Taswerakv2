"use client";

import { useState, useTransition } from "react";
import { Mail, Phone, MapPin, Send, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const channels = [
  {
    icon: Mail,
    label: "البريد الإلكتروني",
    value: "info@taswerak.com",
    color: "#0A9ED9",
    href: "mailto:info@taswerak.com",
  },
  {
    icon: Phone,
    label: "الهاتف / واتساب",
    value: "+966 5X XXX XXXX",
    color: "#00A3AA",
    href: "tel:+9665XXXXXXXX",
  },
  {
    icon: MapPin,
    label: "العنوان",
    value: "جدة، المملكة العربية السعودية",
    color: "#D65221",
    href: null,
  },
];

export function ContactForm() {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      // Simulated submit (real implementation in later phase)
      await new Promise((r) => setTimeout(r, 800));
      toast.success("تم استلام رسالتك! سنردّ خلال 24 ساعة.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    });
  };

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {/* Channels */}
      <div className="lg:col-span-2 space-y-3">
        <h2 className="text-xl font-bold mb-2">معلومات التواصل</h2>
        <p className="text-sm text-muted-foreground mb-4">
          نحن هنا لمساعدتك — تواصل معنا عبر القناة الأنسب لك.
        </p>
        {channels.map((c) => (
          <a
            key={c.label}
            href={c.href || undefined}
            className={`flex items-start gap-3 p-4 rounded-2xl bg-card border border-border/60 ${
              c.href ? "hover:shadow-md transition-shadow" : "cursor-default"
            }`}
          >
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${c.color}15` }}
            >
              <c.icon className="h-5 w-5" style={{ color: c.color }} />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">{c.label}</div>
              <div className="font-semibold mt-0.5 break-words" dir="ltr">{c.value}</div>
            </div>
          </a>
        ))}
      </div>

      {/* Form */}
      <div className="lg:col-span-3">
        <Card className="rounded-2xl border-border/60">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <MessageSquare className="h-5 w-5 text-[#0A9ED9]" />
              <h2 className="text-xl font-bold">أرسل رسالة</h2>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم *</Label>
                  <Input id="name" required value={form.name} onChange={update("name")} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني *</Label>
                  <Input id="email" type="email" required value={form.email} onChange={update("email")} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الجوال</Label>
                  <Input id="phone" type="tel" value={form.phone} onChange={update("phone")} className="rounded-xl" dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">الموضوع *</Label>
                  <Input id="subject" required value={form.subject} onChange={update("subject")} className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">رسالتك *</Label>
                <Textarea
                  id="message"
                  required
                  value={form.message}
                  onChange={update("message")}
                  className="rounded-xl min-h-[140px]"
                  placeholder="اكتب رسالتك هنا..."
                />
              </div>
              <Button
                type="submit"
                disabled={pending}
                className="w-full rounded-xl brand-gradient text-white hover:opacity-90 h-11"
              >
                {pending ? (
                  <><Loader2 className="h-4 w-4 animate-spin ml-1" /> جارٍ الإرسال...</>
                ) : (
                  <>إرسال <Send className="h-4 w-4 mr-1" /></>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
