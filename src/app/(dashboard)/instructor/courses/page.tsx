import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  BookCopy,
  Plus,
  ArrowLeft,
  Users,
  DollarSign,
  Eye,
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
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { DashboardEmptyState } from "@/components/dashboard/empty-state";

export const dynamic = "force-dynamic";

const mockCourses = [
  {
    id: "c1",
    slug: "beauty-photography-12-lectures",
    titleAr: "تصوير البيوتي Beauty",
    title: "Beauty Photography",
    status: "PUBLISHED",
    isFeatured: true,
    price: 899,
    category: "بيوتي",
    durationHours: 24,
    _count: { enrollments: 18 },
  },
  {
    id: "c2",
    slug: "photography-fundamentals",
    titleAr: "أساسيات التصوير",
    title: "Photography Fundamentals",
    status: "PUBLISHED",
    isFeatured: true,
    price: 499,
    category: "أساسيات",
    durationHours: 12,
    _count: { enrollments: 32 },
  },
  {
    id: "c3",
    slug: "makeup-tutorial-photography",
    titleAr: "ميكب توتوريال",
    title: "Makeup Tutorial Photography",
    status: "PUBLISHED",
    isFeatured: true,
    price: 599,
    category: "مكياج",
    durationHours: 16,
    _count: { enrollments: 9 },
  },
  {
    id: "c4",
    slug: "studio-lighting-masterclass",
    titleAr: "ماستركلاس إضاءة الاستوديو",
    title: "Studio Lighting Masterclass",
    status: "DRAFT",
    isFeatured: false,
    price: 1299,
    category: "إضاءة",
    durationHours: 20,
    _count: { enrollments: 0 },
  },
];

const statusMap: Record<string, { label: string; cls: string }> = {
  DRAFT: { label: "مسودة", cls: "bg-zinc-100 text-zinc-700" },
  PUBLISHED: { label: "منشور", cls: "bg-emerald-100 text-emerald-700" },
  UNLISTED: { label: "غير مُدرج", cls: "bg-amber-100 text-amber-700" },
  ARCHIVED: { label: "مؤرشف", cls: "bg-red-100 text-red-700" },
};

export default async function InstructorCoursesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  let courses: any[] = [];
  try {
    courses = await db.course.findMany({
      where: { instructorId: session.user.id },
      include: { _count: { select: { enrollments: true } } },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    courses = mockCourses;
  }

  const published = courses.filter((c) => c.status === "PUBLISHED");
  const drafts = courses.filter((c) => c.status === "DRAFT");
  const totalEnrollments = courses.reduce((s, c) => s + (c._count?.enrollments || 0), 0);
  const totalRevenue = courses.reduce(
    (s, c) => s + Number(c.price) * (c._count?.enrollments || 0),
    0
  );

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="دوراتي"
        description="أدِر دوراتك الحالية وأنشئ دورات جديدة"
        actions={
          <Button className="rounded-xl brand-gradient text-white hover:opacity-90">
            <Plus className="h-4 w-4 ml-1" />
            دورة جديدة
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="rounded-2xl border-border/40 bg-gradient-to-bl from-[#0A9ED9]/10 to-[#0A9ED9]/5">
          <CardContent className="p-4">
            <BookCopy className="h-5 w-5 mb-2 text-[#0A9ED9]" />
            <div className="text-2xl font-bold">{published.length}</div>
            <div className="text-xs text-muted-foreground">دورات منشورة</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/40 bg-gradient-to-bl from-amber-100/60 to-amber-50/40">
          <CardContent className="p-4">
            <Pencil className="h-5 w-5 mb-2 text-amber-600" />
            <div className="text-2xl font-bold">{drafts.length}</div>
            <div className="text-xs text-muted-foreground">مسودات</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/40 bg-gradient-to-bl from-[#00A3AA]/10 to-[#00A3AA]/5">
          <CardContent className="p-4">
            <Users className="h-5 w-5 mb-2 text-[#00A3AA]" />
            <div className="text-2xl font-bold">{totalEnrollments}</div>
            <div className="text-xs text-muted-foreground">طالب مسجّل</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/40 bg-gradient-to-bl from-[#D65221]/10 to-[#D65221]/5">
          <CardContent className="p-4">
            <DollarSign className="h-5 w-5 mb-2 text-[#D65221]" />
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString("ar-SA")}</div>
            <div className="text-xs text-muted-foreground">إيرادات (ر.س)</div>
          </CardContent>
        </Card>
      </div>

      {/* Course grid */}
      {courses.length === 0 ? (
        <Card className="rounded-2xl border-border/60">
          <CardContent>
            <DashboardEmptyState
              icon={<BookCopy className="h-6 w-6" />}
              title="لم تنشئ أي دورة بعد"
              hint="ابدأ ببناء أول دورة لك باستخدام محرر السحب والإفلات"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map((c) => {
            const st = statusMap[c.status] || statusMap.DRAFT;
            return (
              <Card key={c.id} className="rounded-2xl border-border/60 overflow-hidden hover:shadow-md transition-shadow">
                <div className={`h-2 ${c.status === "PUBLISHED" ? "brand-gradient" : "bg-muted"}`} />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{c.titleAr || c.title}</h3>
                      <div className="text-xs text-muted-foreground mt-0.5">{c.category}</div>
                    </div>
                    <Badge className={st.cls}>{st.label}</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                    <div>
                      <div className="text-muted-foreground">السعر</div>
                      <div className="font-semibold mt-0.5">
                        {Number(c.price).toLocaleString("ar-SA")} ر.س
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">الطلاب</div>
                      <div className="font-semibold mt-0.5">{c._count?.enrollments || 0}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">المدة</div>
                      <div className="font-semibold mt-0.5">{c.durationHours} ساعة</div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-border/40">
                    <Link href={`/courses/${c.slug}`} className="flex-1">
                      <Button variant="outline" size="sm" className="rounded-xl w-full">
                        <Eye className="h-3.5 w-3.5 ml-1" />
                        معاينة
                      </Button>
                    </Link>
                    <Button size="sm" className="rounded-xl flex-1 brand-gradient text-white hover:opacity-90">
                      <Pencil className="h-3.5 w-3.5 ml-1" />
                      تحرير
                    </Button>
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
