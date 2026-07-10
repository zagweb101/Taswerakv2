"use client";

import { useState } from "react";
import { User, Lock, Bell, Shield, Loader2 } from "lucide-react";
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
import { useSettings } from "@/hooks/use-settings";

interface StudentSettings {
  profile: {
    name: string;
    email: string;
    phone: string;
    bio: string;
    avatarUrl: string | null;
  };
  notifications: {
    emailPayments: boolean;
    emailCritiques: boolean;
    emailCourses: boolean;
    smsNotifications: boolean;
  };
  privacy: { publicProfile: boolean };
}

export default function StudentSettingsPage() {
  const { settings, loading, saving, saveSection } = useSettings<StudentSettings>({
    endpoint: "/api/student/settings",
  });

  // Editable profile fields (synced from API response)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Sync settings → local state ONCE when first loaded
  if (settings?.profile && !profileLoaded) {
    setName(settings.profile.name || "");
    setEmail(settings.profile.email || "");
    setPhone(settings.profile.phone || "");
    setBio(settings.profile.bio || "");
    setProfileLoaded(true);
  }

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    await saveSection("profile", { name, email, phone, bio });
    setSavingProfile(false);
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }
    if (newPwd.length < 8) {
      toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }
    setSavingPwd(true);
    const ok = await saveSection("password", {
      currentPassword: currentPwd,
      newPassword: newPwd,
    });
    if (ok) {
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    }
    setSavingPwd(false);
  };

  const updateNotification = (key: keyof NonNullable<typeof settings>["notifications"]) => async (v: boolean) => {
    if (!settings) return;
    const updated = { ...settings.notifications, [key]: v };
    setSavingPrefs(true);
    await saveSection("notifications", updated);
    setSavingPrefs(false);
  };

  const updatePrivacy = (key: keyof NonNullable<typeof settings>["privacy"]) => async (v: boolean) => {
    if (!settings) return;
    const updated = { ...settings.privacy, [key]: v };
    await saveSection("privacy", updated);
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">الإعدادات</h1>
          <p className="text-muted-foreground mt-1">جارٍ التحميل...</p>
        </div>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="rounded-2xl border-border/60">
            <CardContent className="p-6">
              <div className="h-6 w-1/3 skeleton-shimmer rounded-lg mb-4" />
              <div className="h-10 w-full skeleton-shimmer rounded-lg mb-3" />
              <div className="h-10 w-full skeleton-shimmer rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">الإعدادات</h1>
        <p className="text-muted-foreground mt-1">اضبط ملفك الشخصي وتفضيلاتك</p>
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
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الجوال</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="bio">نبذة عنك</Label>
                <Input id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="rounded-xl" />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={savingProfile} className="rounded-xl brand-gradient text-white hover:opacity-90">
                {savingProfile && <Loader2 className="h-4 w-4 animate-spin ml-1" />}
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
              <Button type="submit" disabled={savingPwd} variant="outline" className="rounded-xl">
                {savingPwd && <Loader2 className="h-4 w-4 animate-spin ml-1" />}
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
          <PrefRow title="تحديثات المدفوعات" desc="اعتماد أو رفض إيصالاتك" checked={settings?.notifications.emailPayments ?? true} onCheck={updateNotification("emailPayments")} disabled={savingPrefs} />
          <Separator />
          <PrefRow title="نقد الأعمال" desc="عندما يردّ المدرّب على أعمالك" checked={settings?.notifications.emailCritiques ?? true} onCheck={updateNotification("emailCritiques")} disabled={savingPrefs} />
          <Separator />
          <PrefRow title="دورات جديدة" desc="إشعارات عند إطلاق دورات جديدة" checked={settings?.notifications.emailCourses ?? false} onCheck={updateNotification("emailCourses")} disabled={savingPrefs} />
          <Separator />
          <PrefRow title="إشعارات SMS" desc="رسائل نصية للأحداث المهمة" checked={settings?.notifications.smsNotifications ?? false} onCheck={updateNotification("smsNotifications")} disabled={savingPrefs} />
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
            checked={settings?.privacy.publicProfile ?? true}
            onCheck={updatePrivacy("publicProfile")}
            disabled={saving}
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
  disabled,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onCheck: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <div className="font-medium text-sm">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheck} disabled={disabled} />
    </div>
  );
}
