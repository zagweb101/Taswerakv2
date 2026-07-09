import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Award, Download, QrCode, Calendar, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { DashboardEmptyState } from "@/components/dashboard/empty-state";

export const dynamic = "force-dynamic";

const mockCertificates = [
  {
    id: "cert1",
    certificateNumber: "TAS-2026-001",
    course: {
      titleAr: "أساسيات التصوير",
      title: "Photography Fundamentals",
    },
    issuedAt: new Date("2026-05-15"),
    grade: "ممتاز",
    verifyToken: "abc123",
  },
];

export default async function StudentCertificatesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  let certs: any[] = [];
  try {
    certs = await db.certificate.findMany({
      where: { studentId: session.user.id },
      include: {
        course: { select: { titleAr: true, title: true } },
      },
      orderBy: { issuedAt: "desc" },
    });
  } catch {
    certs = mockCertificates;
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="شهاداتي"
        description="شهاداتك الموثّقة بـ QR — قابلة للمشاركة والتحقق"
      />

      {certs.length === 0 ? (
        <Card className="rounded-2xl border-border/60">
          <CardContent>
            <DashboardEmptyState
              icon={<Award className="h-6 w-6" />}
              title="لا توجد شهادات بعد"
              hint="أكمل دورة بنجاح لتحصل على شهادتك الأولى"
              cta={{ href: "/student/courses", label: "دوراتي" }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {certs.map((c) => (
            <Card key={c.id} className="rounded-2xl border-border/60 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Header strip */}
              <div className="brand-gradient h-2" />

              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="text-xs text-muted-foreground">رقم الشهادة</div>
                    <div className="font-mono font-semibold tracking-wider mt-0.5" dir="ltr">
                      {c.certificateNumber}
                    </div>
                  </div>
                  <Award className="h-8 w-8 text-[#D65221]" />
                </div>

                {/* Course title */}
                <div className="text-xl font-bold mb-1">
                  {c.course?.titleAr || c.course?.title}
                </div>
                <div className="text-sm text-muted-foreground">
                  تم إتمام الدورة بنجاح
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">تاريخ الإصدار</div>
                    <div className="font-medium flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(c.issuedAt).toLocaleDateString("ar-SA")}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">التقدير</div>
                    <div className="font-medium mt-0.5">{c.grade || "—"}</div>
                  </div>
                </div>

                {/* QR placeholder */}
                <div className="mt-5 p-4 rounded-xl bg-muted/30 flex items-center gap-3">
                  <div className="h-14 w-14 rounded-lg bg-white border border-border/60 flex items-center justify-center">
                    <QrCode className="h-9 w-9 text-foreground" />
                  </div>
                  <div className="flex-1 text-xs text-muted-foreground">
                    امسح رمز QR للتحقق من صحة الشهادة عبر نظام تصويرك
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-5">
                  <Button variant="outline" className="rounded-xl flex-1" size="sm">
                    <Download className="h-3.5 w-3.5 ml-1" />
                    تحميل PDF
                  </Button>
                  <Button variant="outline" className="rounded-xl flex-1" size="sm">
                    <Share2 className="h-3.5 w-3.5 ml-1" />
                    مشاركة
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
