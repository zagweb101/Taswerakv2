"use client";

import { useState } from "react";
import {
  Settings2,
  Mail,
  Database,
  Banknote,
  ShieldCheck,
  Globe,
  Loader2,
  Save,
  Webhook,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState<string | null>(null);

  const [smtp, setSmtp] = useState({
    host: "",
    port: "587",
    user: "",
    password: "",
    from: "no-reply@taswerak.com",
    transport: "simulation",
  });

  const [minio, setMinio] = useState({
    endpoint: "http://localhost:9000",
    bucket: "taswerak-uploads",
    accessKey: "taswerak_minio",
    secretKey: "taswerak_minio_secret",
    publicUrl: "http://localhost:9000",
  });

  const [bank, setBank] = useState({
    name: "البنك الأهلي السعودي",
    accountName: "أحمد زغلول - تصويرك",
    iban: "SA0000000000000000000000",
    accountNumber: "0000000000000",
  });

  const [flags, setFlags] = useState({
    enableSignup: true,
    enableImpersonation: true,
    enableCertificates: true,
    enablePublicCourses: true,
    maintenanceMode: false,
    requireEmailVerification: false,
  });

  const [cms, setCms] = useState({
    heroTitle: "تعلّم التصوير من الصفر للاحتراف",
    heroSubtitle: "دورات مباشرة مع أحمد زغلول في جدة",
    footerNote: "© 2026 تصويرك — جميع الحقوق محفوظة",
  });

  const [auditPolicy, setAuditPolicy] = useState({
    logAuth: true,
    logPayments: true,
    logContentChanges: true,
    retentionDays: "365",
  });

  const triggerSave = (key: string, label: string) => (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(key);
    setTimeout(() => {
      setSaving(null);
      toast.success(`تم حفظ ${label}`);
    }, 600);
  };

  const toggleFlag = (k: keyof typeof flags) => (v: boolean) =>
    setFlags((f) => ({ ...f, [k]: v }));

  const toggleAudit = (k: keyof typeof auditPolicy) => (v: boolean) =>
    setAuditPolicy((a) => ({ ...a, [k]: v }));

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <Settings2 className="h-6 w-6 text-[#D65221]" />
            إعدادات النظام
          </h1>
          <p className="text-muted-foreground mt-1">
            تهيئة البنية التحتية والميزات والسياسات
          </p>
        </div>
        <Badge className="bg-[#D65221] text-white">صلاحيات المدير</Badge>
      </div>

      {/* Feature flags */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#D65221]/10 flex items-center justify-center text-[#D65221]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>مفاتيح الميزات</CardTitle>
              <CardDescription>تفعيل/إيقاف ميزات النظام</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <FlagRow label="السماح بالتسجيل الجديد" desc="إغلاق التسجيل مؤقتاً عند الحاجة" checked={flags.enableSignup} onCheck={toggleFlag("enableSignup")} />
          <Separator />
          <FlagRow label="تسجيل الدخول نيابةً (Impersonate)" desc="للتحقق من تجربة مستخدم معيّن" checked={flags.enableImpersonation} onCheck={toggleFlag("enableImpersonation")} />
          <Separator />
          <FlagRow label="إصدار الشهادات" desc="السماح بإصدار شهادات QR" checked={flags.enableCertificates} onCheck={toggleFlag("enableCertificates")} />
          <Separator />
          <FlagRow label="عرض الدورات على الواجهة" desc="إذا كان متوقفاً يظهر فقط للطلاب المسجلين" checked={flags.enablePublicCourses} onCheck={toggleFlag("enablePublicCourses")} />
          <Separator />
          <FlagRow label="تأكيد البريد الإلكتروني" desc="إلزام المستخدمين بتأكيد بريدهم" checked={flags.requireEmailVerification} onCheck={toggleFlag("requireEmailVerification")} />
          <Separator />
          <FlagRow
            label="وضع الصيانة"
            desc="يوقف الوصول للوحة الطلاب ويُظهر رسالة للزوار"
            checked={flags.maintenanceMode}
            onCheck={toggleFlag("maintenanceMode")}
            danger
          />
        </CardContent>
      </Card>

      {/* SMTP */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#0A9ED9]/10 flex items-center justify-center text-[#0A9ED9]">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>إعدادات البريد</CardTitle>
              <CardDescription>SMTP لإرسال الإشعارات والإيصالات</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={triggerSave("smtp", "إعدادات البريد")} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label>نوع النقل</Label>
                <div className="flex gap-2">
                  <Button type="button" variant={smtp.transport === "simulation" ? "default" : "outline"} size="sm" className="rounded-xl" onClick={() => setSmtp({ ...smtp, transport: "simulation" })}>
                    محاكاة (تطوير)
                  </Button>
                  <Button type="button" variant={smtp.transport === "smtp" ? "default" : "outline"} size="sm" className="rounded-xl" onClick={() => setSmtp({ ...smtp, transport: "smtp" })}>
                    SMTP حقيقي
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="host">المضيف (Host)</Label>
                <Input id="host" value={smtp.host} onChange={(e) => setSmtp({ ...smtp, host: e.target.value })} className="rounded-xl" placeholder="smtp.gmail.com" disabled={smtp.transport === "simulation"} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">المنفذ (Port)</Label>
                <Input id="port" value={smtp.port} onChange={(e) => setSmtp({ ...smtp, port: e.target.value })} className="rounded-xl" disabled={smtp.transport === "simulation"} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user">اسم المستخدم</Label>
                <Input id="user" value={smtp.user} onChange={(e) => setSmtp({ ...smtp, user: e.target.value })} className="rounded-xl" disabled={smtp.transport === "simulation"} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pwd">كلمة المرور</Label>
                <Input id="pwd" type="password" value={smtp.password} onChange={(e) => setSmtp({ ...smtp, password: e.target.value })} className="rounded-xl" disabled={smtp.transport === "simulation"} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="from">البريد المُرسِل</Label>
                <Input id="from" type="email" value={smtp.from} onChange={(e) => setSmtp({ ...smtp, from: e.target.value })} className="rounded-xl" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving === "smtp"} className="rounded-xl">
                {saving === "smtp" && <Loader2 className="h-4 w-4 animate-spin ml-1" />}
                <Save className="h-4 w-4 ml-1" />
                حفظ
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* MinIO */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#00A3AA]/10 flex items-center justify-center text-[#00A3AA]">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>تخزين الملفات (MinIO / S3)</CardTitle>
              <CardDescription>لتخزين إيصالات الدفع وأعمال الطلاب</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={triggerSave("minio", "إعدادات التخزين")} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endpoint">Endpoint</Label>
                <Input id="endpoint" value={minio.endpoint} onChange={(e) => setMinio({ ...minio, endpoint: e.target.value })} className="rounded-xl" dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bucket">Bucket</Label>
                <Input id="bucket" value={minio.bucket} onChange={(e) => setMinio({ ...minio, bucket: e.target.value })} className="rounded-xl" dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ak">Access Key</Label>
                <Input id="ak" value={minio.accessKey} onChange={(e) => setMinio({ ...minio, accessKey: e.target.value })} className="rounded-xl" dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sk">Secret Key</Label>
                <Input id="sk" type="password" value={minio.secretKey} onChange={(e) => setMinio({ ...minio, secretKey: e.target.value })} className="rounded-xl" dir="ltr" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="publicUrl">Public URL</Label>
                <Input id="publicUrl" value={minio.publicUrl} onChange={(e) => setMinio({ ...minio, publicUrl: e.target.value })} className="rounded-xl" dir="ltr" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving === "minio"} className="rounded-xl">
                {saving === "minio" && <Loader2 className="h-4 w-4 animate-spin ml-1" />}
                <Save className="h-4 w-4 ml-1" />
                حفظ
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Bank */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Banknote className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>بيانات الحساب البنكي</CardTitle>
              <CardDescription>تُعرض للطلاب عند رفع إيصال التحويل</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={triggerSave("bank", "بيانات البنك")} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bname">اسم البنك</Label>
                <Input id="bname" value={bank.name} onChange={(e) => setBank({ ...bank, name: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="acname">اسم صاحب الحساب</Label>
                <Input id="acname" value={bank.accountName} onChange={(e) => setBank({ ...bank, accountName: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input id="iban" value={bank.iban} onChange={(e) => setBank({ ...bank, iban: e.target.value })} className="rounded-xl" dir="ltr" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="accnum">رقم الحساب</Label>
                <Input id="accnum" value={bank.accountNumber} onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })} className="rounded-xl" dir="ltr" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving === "bank"} className="rounded-xl">
                {saving === "bank" && <Loader2 className="h-4 w-4 animate-spin ml-1" />}
                <Save className="h-4 w-4 ml-1" />
                حفظ
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* CMS */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>محتوى الواجهة (CMS)</CardTitle>
              <CardDescription>النصوص الرئيسية للموقع العام</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={triggerSave("cms", "محتوى الواجهة")} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="heroTitle">عنوان البطل (Hero)</Label>
              <Input id="heroTitle" value={cms.heroTitle} onChange={(e) => setCms({ ...cms, heroTitle: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroSub">العنوان الفرعي</Label>
              <Input id="heroSub" value={cms.heroSubtitle} onChange={(e) => setCms({ ...cms, heroSubtitle: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="footer">ملاحظة التذييل</Label>
              <Textarea id="footer" value={cms.footerNote} onChange={(e) => setCms({ ...cms, footerNote: e.target.value })} className="rounded-xl min-h-[60px]" />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving === "cms"} className="rounded-xl">
                {saving === "cms" && <Loader2 className="h-4 w-4 animate-spin ml-1" />}
                <Save className="h-4 w-4 ml-1" />
                حفظ
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Audit policy */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-zinc-200 flex items-center justify-center text-zinc-700">
              <Webhook className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>سياسة التدقيق</CardTitle>
              <CardDescription>ما يتم تسجيله في سجل التدقيق</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <FlagRow label="تسجيل عمليات الدخول" desc="محاولات ناجحة وفاشلة" checked={auditPolicy.logAuth} onCheck={toggleAudit("logAuth")} />
          <Separator />
          <FlagRow label="تسجيل المدفوعات" desc="كل عملية اعتماد/رفض إيصال" checked={auditPolicy.logPayments} onCheck={toggleAudit("logPayments")} />
          <Separator />
          <FlagRow label="تسجيل تعديلات المحتوى" desc="كل تعديل على CMS والدورات" checked={auditPolicy.logContentChanges} onCheck={toggleAudit("logContentChanges")} />
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="retention">مدة الاحتفاظ (يوم)</Label>
            <Input id="retention" type="number" value={auditPolicy.retentionDays} onChange={(e) => setAuditPolicy({ ...auditPolicy, retentionDays: e.target.value })} className="rounded-xl max-w-[200px]" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FlagRow({
  label,
  desc,
  checked,
  onCheck,
  danger,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onCheck: (v: boolean) => void;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <div className={`font-medium text-sm ${danger ? "text-destructive" : ""}`}>{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheck} />
    </div>
  );
}
