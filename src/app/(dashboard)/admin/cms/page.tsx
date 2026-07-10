import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  FileText,
  Globe,
  Star,
  Save,
  Eye,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DashboardPageHeader } from "@/components/dashboard/page-header";

export const dynamic = "force-dynamic";

const mockTestimonials = [
  { id: "t1", name: "صفاء", role: "طالبة تصوير", rating: 5, comment: "تجربة استثنائية...", isFeatured: true, isPublished: true },
  { id: "t2", name: "أماني بخش", role: "مصورة بيوتي", rating: 5, comment: "دورة تصوير البيوتي غيّرت أسلوبي...", isFeatured: true, isPublished: true },
  { id: "t3", name: "المها اليازيدي", role: "صانعة محتوى مكياج", rating: 5, comment: "دورة ميكب توتوريال ممتازة...", isFeatured: true, isPublished: true },
];

export default async function AdminCmsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  let testimonials = mockTestimonials;
  let heroContent = {
    heroTitle: "تعلّم التصوير من الصفر للاحتراف",
    heroSubtitle: "دورات مباشرة مع أحمد زغلول في جدة",
    footerNote: "© 2026 تصويرك — جميع الحقوق محفوظة",
  };
  try {
    const [tList, heroTitle, heroSub, footer] = await Promise.all([
      db.review.findMany({
        where: { isPublished: true },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      }),
      db.cmsContent.findUnique({ where: { key: "hero_title" } }),
      db.cmsContent.findUnique({ where: { key: "hero_subtitle" } }),
      db.cmsContent.findUnique({ where: { key: "footer_note" } }),
    ]);
    if (tList.length > 0) testimonials = tList as any;
    if (heroTitle || heroSub || footer) {
      heroContent = {
        heroTitle: heroTitle?.value || heroContent.heroTitle,
        heroSubtitle: heroSub?.value || heroContent.heroSubtitle,
        footerNote: footer?.value || heroContent.footerNote,
      };
    }
  } catch {
    // DB unavailable — use mocks
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="إدارة المحتوى"
        description="تحكّم في نصوص الواجهة وآراء الطلاب المميزة"
        actions={
          <Button className="rounded-xl brand-gradient text-white hover:opacity-90">
            <Plus className="h-4 w-4 ml-1" />
            شهادة جديدة
          </Button>
        }
      />

      {/* Hero content */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#0A9ED9]/10 flex items-center justify-center text-[#0A9ED9]">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>نصوص الواجهة الرئيسية</CardTitle>
              <CardDescription>تظهر في الصفحة الأولى للموقع</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="heroTitle">عنوان البطل (Hero Title)</Label>
            <Input id="heroTitle" defaultValue={heroContent.heroTitle} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="heroSub">العنوان الفرعي</Label>
            <Input id="heroSub" defaultValue={heroContent.heroSubtitle} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="footerNote">ملاحظة التذييل</Label>
            <Textarea id="footerNote" defaultValue={heroContent.footerNote} className="rounded-xl min-h-[60px]" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" className="rounded-xl">
              <Eye className="h-4 w-4 ml-1" />
              معاينة
            </Button>
            <Button className="rounded-xl brand-gradient text-white hover:opacity-90">
              <Save className="h-4 w-4 ml-1" />
              حفظ التغييرات
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Testimonials management */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#D65221]/10 flex items-center justify-center text-[#D65221]">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>آراء الطلاب المميزة</CardTitle>
              <CardDescription>{testimonials.length} شهادة منشورة</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {testimonials.map((t: any) => (
            <div
              key={t.id}
              className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="h-10 w-10 rounded-full brand-gradient flex items-center justify-center text-white font-bold shrink-0">
                {t.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{t.name}</span>
                  <span className="text-xs text-muted-foreground">· {t.role}</span>
                  {t.isFeatured && (
                    <Badge className="bg-[#D65221]/10 text-[#D65221]">
                      <Star className="h-3 w-3 ml-0.5 fill-current" />
                      مميّزة
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {t.comment}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground" title="تحرير">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-muted-foreground" title="حذف">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* CMS content blocks */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#00A3AA]/10 flex items-center justify-center text-[#00A3AA]">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>كتل المحتوى</CardTitle>
              <CardDescription>نصوص قابلة للتحرير في صفحات متعددة</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            <ContentBlock label="bank_name" value="البنك الأهلي السعودي" />
            <ContentBlock label="bank_account_name" value="أحمد زغلول - تصويرك" />
            <ContentBlock label="bank_iban" value="SA00 0000 0000 0000 0000" dir="ltr" />
            <ContentBlock label="contact_email" value="info@taswerak.com" dir="ltr" />
            <ContentBlock label="contact_phone" value="+966 5X XXX XXXX" dir="ltr" />
            <ContentBlock label="city" value="جدة" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ContentBlock({ label, value, dir }: { label: string; value: string; dir?: string }) {
  return (
    <div className="p-3 rounded-xl bg-muted/30">
      <div className="text-xs text-muted-foreground font-mono">{label}</div>
      <div className="text-sm font-medium mt-1" dir={dir || "rtl"}>{value}</div>
    </div>
  );
}
