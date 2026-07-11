import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Image, MessageSquare, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { DashboardEmptyState } from "@/components/dashboard/empty-state";
import { SubmissionStatusBadge } from "@/components/dashboard/status-badges";

export const dynamic = "force-dynamic";

const mockSubmissions = [
  {
    id: "sub1",
    imageUrl: "",
    caption: "تجربة إضاءة رمبرانت على بورتريه",
    status: "SUBMITTED",
    submittedAt: new Date("2026-07-09"),
    exifData: { camera: "Sony A7III", lens: "85mm f/1.8", iso: 200, aperture: "f/2.8", shutter: "1/200" },
    assignment: {
      title: "تمرين الإضاءة الجانبية",
      course: { titleAr: "تصوير البيوتي Beauty", title: "Beauty" },
    },
    student: { id: "s1", name: "صفاء العتيبي" },
  },
  {
    id: "sub2",
    imageUrl: "",
    caption: "ماكرو لعين مع مكياج smoky",
    status: "UNDER_REVIEW",
    submittedAt: new Date("2026-07-08"),
    exifData: { camera: "Canon R6", lens: "100mm Macro", iso: 400, aperture: "f/8", shutter: "1/125" },
    assignment: {
      title: "تصوير المكياج بالماكرو",
      course: { titleAr: "ميكب توتوريال", title: "Makeup" },
    },
    student: { id: "s2", name: "أماني بخش" },
  },
  {
    id: "sub3",
    imageUrl: "",
    caption: "بورتريه بإضاءة ناعمة",
    status: "CRITIQUED",
    submittedAt: new Date("2026-07-05"),
    critique: "إضاءة ممتازة! حاولي تقليل الظل تحت الذقن قليلاً في المرة القادمة.",
    exifData: { camera: "Sony A7III", lens: "50mm f/1.4", iso: 100, aperture: "f/2", shutter: "1/250" },
    assignment: {
      title: "بورتريه بإضاءة ناعمة",
      course: { titleAr: "أساسيات التصوير", title: "Fundamentals" },
    },
    student: { id: "s3", name: "المها اليازيدي" },
  },
];

export default async function InstructorCritiquesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  let submissions: any[] = [];
  try {
    submissions = await db.submission.findMany({
      where: { assignment: { course: { instructorId: session.user.id } } },
      include: {
        assignment: {
          select: { title: true, course: { select: { titleAr: true, title: true } } },
        },
        student: { select: { id: true, name: true } },
      },
      orderBy: { submittedAt: "desc" },
    });
  } catch {
    submissions = mockSubmissions;
  }

  const submitted = submissions.filter((s) => s.status === "SUBMITTED" || s.status === "UNDER_REVIEW");
  const critiqued = submissions.filter((s) => s.status === "CRITIQUED" || s.status === "APPROVED");

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="نقد الأعمال"
        description="راجع أعمال الطلاب وأضف نقوداً تفصيلية بـ Pin على الصور"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Card className="rounded-2xl border-amber-200/60 bg-amber-50/40">
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 mx-auto text-amber-600 mb-1" />
            <div className="text-2xl font-bold text-amber-600">{submitted.length}</div>
            <div className="text-xs text-muted-foreground">بانتظار نقدك</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-emerald-200/60 bg-emerald-50/40">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-5 w-5 mx-auto text-emerald-600 mb-1" />
            <div className="text-2xl font-bold text-emerald-600">{critiqued.length}</div>
            <div className="text-xs text-muted-foreground">تم النقد</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/40 bg-gradient-to-bl from-[#0A9ED9]/10 to-[#0A9ED9]/5">
          <CardContent className="p-4 text-center">
            <Image className="h-5 w-5 mx-auto text-[#0A9ED9] mb-1" />
            <div className="text-2xl font-bold">{submissions.length}</div>
            <div className="text-xs text-muted-foreground">إجمالي الأعمال</div>
          </CardContent>
        </Card>
      </div>

      {submissions.length === 0 ? (
        <Card className="rounded-2xl border-border/60">
          <CardContent>
            <DashboardEmptyState
              icon={<Image className="h-6 w-6" />}
              title="لا توجد أعمال بانتظار النقد"
              hint="ستظهر هنا أعمال الطلاب فور رفعها"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {submissions.map((s) => (
            <Card key={s.id} className="rounded-2xl border-border/60 overflow-hidden hover:shadow-md transition-shadow">
              {/* Image */}
              <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                { }
                <img
                  src={s.imageUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Cg%3E%3Ccircle cx='200' cy='150' r='40' fill='%23ddd'/%3E%3Cpath d='M170 200 Q200 230 230 200 L230 240 L170 240 Z' fill='%23ddd'/%3E%3C/g%3E%3C/svg%3E"}
                  alt={s.caption || "عمل طالب"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <SubmissionStatusBadge status={s.status} />
                </div>
              </div>

              {/* Body */}
              <CardContent className="p-4">
                <div className="font-semibold text-sm">{s.assignment.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {s.assignment.course.titleAr || s.assignment.course.title}
                </div>

                <div className="text-xs text-muted-foreground mt-2">
                  بواسطة{" "}
                  <Link
                    href={`/instructor/students/${s.student.id}`}
                    className="font-medium text-foreground hover:text-[#0A9ED9] hover:underline"
                  >
                    {s.student.name}
                  </Link>
                </div>

                {s.caption && (
                  <p className="text-xs mt-2 text-foreground/80 line-clamp-2">{s.caption}</p>
                )}

                {/* EXIF */}
                {s.exifData && (
                  <div className="mt-3 p-2 rounded-lg bg-muted/40 text-[10px] grid grid-cols-2 gap-1">
                    {Object.entries(s.exifData).slice(0, 4).map(([k, v]) => (
                      <div key={k}>
                        <span className="text-muted-foreground">{k}: </span>
                        <span className="font-medium">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Critique preview */}
                {s.critique && (
                  <div className="mt-3 p-2 rounded-lg bg-[#00A3AA]/5 border border-[#00A3AA]/20 text-xs">
                    <div className="font-semibold text-[#00A3AA] flex items-center gap-1 mb-1">
                      <MessageSquare className="h-3 w-3" /> نقدها السابق
                    </div>
                    <p className="line-clamp-2 text-foreground/80">{s.critique}</p>
                  </div>
                )}

                {/* Action */}
                <Link href={`/instructor/critiques/${s.id}`} className="block w-full mt-3">
                  <Button
                    className="w-full rounded-xl brand-gradient text-white hover:opacity-90"
                    size="sm"
                  >
                    <MessageSquare className="h-3.5 w-3.5 ml-1" />
                    {s.status === "CRITIQUED" || s.status === "APPROVED" ? "تعديل النقد" : "ابدأ النقد"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
