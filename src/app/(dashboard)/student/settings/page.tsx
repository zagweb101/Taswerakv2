"use client";

import { useState } from "react";
import { User, Lock, Bell, Globe, Palette, Shield, Loader2 } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function StudentSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [prefs, setPrefs] = useState({
    emailPayments: true,
    emailCritiques: true,
    emailCourses: false,
    smsNotifications: false,
    publicProfile: true,
  });

  const updatePref = (key: keyof typeof prefs) => (v: boolean) =>
    setPrefs((p) => ({ ...p, [key]: v }));

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("تم حفظ الملف الشخصي");
    }, 600);
  };

  const savePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }
    if (newPwd.length < 8) {
      toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      toast.success("تم تحديث كلمة المرور");
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">الإعدادات</h1>
        <p className="text-muted-foreground mt-1">
          اضبط ملفك الشخصي وتفضيلاتك
        </p>
      </div>

      {/* Profile */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#0A9ED9]/10 flex items-center justify-center text-[#0A9ED9]">
              <User className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>الملف الشخصي</CardTitle>
              <CardDescription>معلوماتك الأساسية</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="brand-gradient text-white text-2xl font-bold rounded-full">
                  {(name || "ت").charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button type="button" variant="outline" size="sm" className="rounded-xl">
                تغيير الصورة
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم الكامل</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" placeholder="اسمك الكامل" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl" placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الجوال</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl" placeholder="+9665xxxxxxxx" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="bio">نبذة عنك</Label>
                <Input id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="rounded-xl" placeholder="مصورة هواة مهتمة بتصوير البيوتي" />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving} className="rounded-xl brand-gradient text-white hover:opacity-90">
                {saving && <Loader2 className="h-4 w-4 animate-spin ml-1" />}
                حفظ التغييرات
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#00A3AA]/10 flex items-center justify-center text-[#00A3AA]">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>كلمة المرور</CardTitle>
              <CardDescription>غيّر كلمة المرور بشكل دوري</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={savePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cpwd">كلمة المرور الحالية</Label>
              <Input id="cpwd" type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} className="rounded-xl" required />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="npwd">كلمة المرور الجديدة</Label>
                <Input id="npwd" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} className="rounded-xl" required minLength={8} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpwd2">تأكيد كلمة المرور</Label>
                <Input id="cpwd2" type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} className="rounded-xl" required minLength={8} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving} variant="outline" className="rounded-xl">
                {saving && <Loader2 className="h-4 w-4 animate-spin ml-1" />}
                تحديث كلمة المرور
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#D65221]/10 flex items-center justify-center text-[#D65221]">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>الإشعارات</CardTitle>
              <CardDescription>اختر ما تريد استلام إشعاراته</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <PrefRow title="تحديثات المدفوعات" desc="اعتماد أو رفض إيصالاتك" checked={prefs.emailPayments} onCheck={updatePref("emailPayments")} />
          <Separator />
          <PrefRow title="نقد الأعمال" desc="عندما يردّ المدرّب على أعمالك" checked={prefs.emailCritiques} onCheck={updatePref("emailCritiques")} />
          <Separator />
          <PrefRow title="دورات جديدة" desc="إشعارات عند إطلاق دورات جديدة" checked={prefs.emailCourses} onCheck={updatePref("emailCourses")} />
          <Separator />
          <PrefRow title="إشعارات SMS" desc="رسائل نصية للأحداث المهمة" checked={prefs.smsNotifications} onCheck={updatePref("smsNotifications")} />
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>الخصوصية</CardTitle>
              <CardDescription>تحكّم في ظهور ملفك</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PrefRow
            title="ملف شخصي عام"
            desc="السماح للآخرين برؤية ملفك وشهاداتك"
            checked={prefs.publicProfile}
            onCheck={updatePref("publicProfile")}
          />
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
