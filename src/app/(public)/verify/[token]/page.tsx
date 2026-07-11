import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Award, Calendar, User, Hash } from "lucide-react";
import { brandGradientText } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function VerifyCertificatePage({ params }: PageProps) {
  const { token } = await params;

  let certificate: any = null;
  try {
    certificate = await db.certificate.findUnique({
      where: { verifyToken: token },
      include: {
        student: { select: { name: true } },
        course: { select: { titleAr: true, title: true } },
      },
    });
  } catch {
    // DB unavailable
  }

  if (!certificate) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-red-100 flex items-center justify-center">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">شهادة غير صالحة</h1>
            <p className="text-muted-foreground">
              هذا الرابط غير صحيح أو الشهادة غير موجودة في سجلاتنا.
            </p>
          </div>
          <Link href="/">
            <Button className="rounded-xl brand-gradient text-white">
              العودة للرئيسية
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const isRevoked = certificate.status === "REVOKED";

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-bl from-[#0A9ED9]/8 via-[#00A3AA]/5 to-[#D65221]/8" />

      <Card className="w-full max-w-lg rounded-3xl border-border/60 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="brand-gradient h-3" />
        <div className="p-8 text-center">
          {isRevoked ? (
            <div className="mx-auto h-16 w-16 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
          ) : (
            <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
          )}

          <h1 className="text-2xl font-bold mb-1">
            {isRevoked ? "شهادة ملغاة" : "شهادة موثّقة"}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {isRevoked
              ? "هذه الشهادة لم تعد صالحة"
              : "تم التحقق من صحة هذه الشهادة عبر منصة تصويرك"}
          </p>

          {/* Certificate details */}
          <div className="text-right space-y-3 mb-6 p-4 rounded-xl bg-muted/30">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="h-3.5 w-3.5" /> الاسم
              </span>
              <span className="font-semibold">{certificate.student?.name || "—"}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Award className="h-3.5 w-3.5" /> الدورة
              </span>
              <span className="font-semibold text-sm">
                {certificate.course?.titleAr || certificate.course?.title || "—"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Hash className="h-3.5 w-3.5" /> رقم الشهادة
              </span>
              <span className="font-mono font-semibold text-sm" dir="ltr">
                {certificate.certificateNumber}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> تاريخ الإصدار
              </span>
              <span className="font-semibold text-sm">
                {new Date(certificate.issuedAt).toLocaleDateString("ar-SA")}
              </span>
            </div>
            {certificate.grade && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">التقدير</span>
                <span className="font-semibold text-sm">{certificate.grade}</span>
              </div>
            )}
          </div>

          <div className={`text-xs ${isRevoked ? "text-red-600" : "text-emerald-600"} font-medium`}>
            {isRevoked ? "✗ تم إلغاء هذه الشهادة" : "✓ شهادة صالحة وموثّقة"}
          </div>
        </div>

        <div className="px-8 pb-6 text-center">
          <p className="text-xs text-muted-foreground mb-3">
            Powered by{" "}
            <span className={brandGradientText + " font-bold"}>تصويرك</span>
          </p>
          <Link href="/">
            <Button variant="outline" size="sm" className="rounded-xl">
              زيارة المنصة
            </Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
