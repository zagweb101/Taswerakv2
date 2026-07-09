"use client";

import { useState } from "react";
import {
  User,
  Wallet,
  Calendar,
  BookCopy,
  CreditCard,
  Loader2,
  Banknote,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function InstructorSettingsPage() {
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    name: "أحمد زغلول",
    title: "مصور محترف ومدرّب تصوير",
    bio: "مصور محترف مقيم في جدة. أؤمن بأن التصوير فن يُتعلّم بالتطبيق.",
    phone: "+966500000001",
    email: "ahmed@taswerak.com",
  });

  const [payout, setPayout] = useState({
    bankName: "البنك الأهلي السعودي",
    iban: "SA0000000000000000000000",
    accountName: "أحمد زغلول",
    payoutFrequency: "MONTHLY",
    minPayout: "500",
  });

  const [schedule, setSchedule] = useState({
    sunday: true,
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: false,
    saturday: false,
    startTime: "10:00",
    endTime: "20:00",
    timezone: "Asia/Riyadh",
  });

  const [courseDefaults, setCourseDefaults] = useState({
    defaultCurrency: "SAR",
    autoApproveEnrollment: false,
    requireExif: true,
    allowResubmission: true,
    defaultLanguage: "ar",
  });

  const [publicProfile, setPublicProfile] = useState(true);

  const save = (which: string) => (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success(`تم حفظ ${which}`);
    }, 500);
  };

  const toggleSchedule = (key: keyof typeof schedule) => (v: boolean) =>
    setSchedule((s) => ({ ...s, [key]: v }));

  const toggleCourseDefault = (key: keyof typeof courseDefaults) => (v: boolean) =>
    setCourseDefaults((c) => ({ ...c, [key]: v }));

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">إعدادات المدرّب</h1>
        <p className="text-muted-foreground mt-1">
          اضبط بياناتك المهنية وطرق الدفع وأوقات التوفر
        </p>
      </div>

      {/* Professional profile */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#0A9ED9]/10 flex items-center justify-center text-[#0A9ED9]">
              <User className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>الملف المهني</CardTitle>
              <CardDescription>كيف يراك الطلاب</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={save("الملف المهني")} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم</Label>
                <Input id="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">المسمّى المهني</Label>
                <Input id="title" value={profile.title} onChange={(e) => setProfile({ ...profile, title: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="bio">النبذة المهنية</Label>
                <Textarea id="bio" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} className="rounded-xl min-h-[100px]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">الجوال</Label>
                <Input id="phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد</Label>
                <Input id="email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="rounded-xl" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving} className="rounded-xl brand-gradient text-white hover:opacity-90">
                {saving && <Loader2 className="h-4 w-4 animate-spin ml-1" />}
                حفظ الملف
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Payout */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#00A3AA]/10 flex items-center justify-center text-[#00A3AA]">
              <Banknote className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>بيانات تحويل الأرباح</CardTitle>
              <CardDescription>أين تصلك مستحقات دوراتك</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={save("بيانات التحويل")} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank">البنك</Label>
                <Input id="bank" value={payout.bankName} onChange={(e) => setPayout({ ...payout, bankName: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accName">اسم صاحب الحساب</Label>
                <Input id="accName" value={payout.accountName} onChange={(e) => setPayout({ ...payout, accountName: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="iban">رقم الآيبان (IBAN)</Label>
                <Input id="iban" value={payout.iban} onChange={(e) => setPayout({ ...payout, iban: e.target.value })} className="rounded-xl tracking-wider" dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>دورية التحويل</Label>
                <Select value={payout.payoutFrequency} onValueChange={(v) => setPayout({ ...payout, payoutFrequency: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEEKLY">أسبوعي</SelectItem>
                    <SelectItem value="MONTHLY">شهري</SelectItem>
                    <SelectItem value="QUARTERLY">ربع سنوي</SelectItem>
                    <SelectItem value="ON_DEMAND">عند الطلب</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="min">الحد الأدنى للتحويل (ر.س)</Label>
                <Input id="min" type="number" value={payout.minPayout} onChange={(e) => setPayout({ ...payout, minPayout: e.target.value })} className="rounded-xl" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving} className="rounded-xl">
                {saving && <Loader2 className="h-4 w-4 animate-spin ml-1" />}
                حفظ البيانات البنكية
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Availability schedule */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#D65221]/10 flex items-center justify-center text-[#D65221]">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>أوقات التوفر</CardTitle>
              <CardDescription>أيام وساعات عملك مع الطلاب</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { key: "sunday", label: "الأحد" },
              { key: "monday", label: "الاثنين" },
              { key: "tuesday", label: "الثلاثاء" },
              { key: "wednesday", label: "الأربعاء" },
              { key: "thursday", label: "الخميس" },
              { key: "friday", label: "الجمعة" },
              { key: "saturday", label: "السبت" },
            ].map((d) => (
              <div
                key={d.key}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                  schedule[d.key as keyof typeof schedule]
                    ? "brand-gradient-soft border-[#00A3AA]/40"
                    : "bg-muted/30 border-border/40"
                }`}
                onClick={() => toggleSchedule(d.key as keyof typeof schedule)(!schedule[d.key as keyof typeof schedule])}
              >
                <span className="text-sm font-medium">{d.label}</span>
                <Switch
                  checked={schedule[d.key as keyof typeof schedule] as boolean}
                  onCheckedChange={toggleSchedule(d.key as keyof typeof schedule)}
                />
              </div>
            ))}
          </div>
          <Separator />
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">من الساعة</Label>
              <Input id="start" type="time" value={schedule.startTime} onChange={(e) => setSchedule({ ...schedule, startTime: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">إلى الساعة</Label>
              <Input id="end" type="time" value={schedule.endTime} onChange={(e) => setSchedule({ ...schedule, endTime: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>المنطقة الزمنية</Label>
              <Select value={schedule.timezone} onValueChange={(v) => setSchedule({ ...schedule, timezone: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Riyadh">الرياض (GMT+3)</SelectItem>
                  <SelectItem value="Asia/Dubai">دبي (GMT+4)</SelectItem>
                  <SelectItem value="Asia/Kuwait">الكويت (GMT+3)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course defaults */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <BookCopy className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>إعدادات الدورات الافتراضية</CardTitle>
              <CardDescription>تُطبّق على أي دورة جديدة</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>العملة الافتراضية</Label>
              <Select value={courseDefaults.defaultCurrency} onValueChange={(v) => setCourseDefaults({ ...courseDefaults, defaultCurrency: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                  <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                  <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>اللغة الافتراضية</Label>
              <Select value={courseDefaults.defaultLanguage} onValueChange={(v) => setCourseDefaults({ ...courseDefaults, defaultLanguage: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">الإنجليزية</SelectItem>
                  <SelectItem value="ar_en">ثنائية اللغة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Separator />
          <PrefRow
            title="اعتماد التسجيل تلقائياً"
            desc="بدون انتظار موافقة يدوية على كل طلب"
            checked={courseDefaults.autoApproveEnrollment}
            onCheck={toggleCourseDefault("autoApproveEnrollment")}
          />
          <Separator />
          <PrefRow
            title="طلب بيانات EXIF للأعمال"
            desc="يجبر الطلاب على رفع صور بأصلها"
            checked={courseDefaults.requireExif}
            onCheck={toggleCourseDefault("requireExif")}
          />
          <Separator />
          <PrefRow
            title="السماح بإعادة التسليم"
            desc="الطالب يمكنه إعادة رفع عمله بعد النقد"
            checked={courseDefaults.allowResubmission}
            onCheck={toggleCourseDefault("allowResubmission")}
          />
        </CardContent>
      </Card>

      {/* Public profile toggle */}
      <Card className="rounded-2xl border-border/60">
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div>
            <div className="font-medium text-sm flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> ظهور الملف العام
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              يظهر اسمك في صفحة المدرّبين على الواجهة
            </div>
          </div>
          <Switch checked={publicProfile} onCheckedChange={setPublicProfile} />
        </CardContent>
      </Card>
    </div>
  );
}

function PrefRow({
  title,
  desc,
  checked,
  onCheck,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onCheck: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <div className="font-medium text-sm">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheck} />
    </div>
  );
}
