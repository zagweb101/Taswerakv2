import { auth } from "@/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Banknote, Clock, FileImage } from "lucide-react";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { brandGradientText } from "@/lib/brand";
import { CheckoutForm } from "@/components/student/checkout/checkout-form";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CheckoutPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "STUDENT") {
    redirect(`/${session.user.role.toLowerCase()}`);
  }

  const { courseId } = await params;

  let course: any = null;
  let existingEnrollment: any = null;
  let bankDetails: any = null;

  try {
    course = await db.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        titleAr: true,
        description: true,
        descriptionAr: true,
        price: true,
        discountPrice: true,
        currency: true,
        level: true,
        category: true,
        durationHours: true,
        status: true,
        isFree: true,
      },
    });

    if (!course || course.status !== "PUBLISHED") {
      notFound();
    }

    // Check existing enrollment
    existingEnrollment = await db.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: course.id,
        },
      },
      select: { id: true, status: true },
    });

    // Handle Free Course instant enrollment
    if (course.isFree) {
      if (!existingEnrollment) {
        await db.enrollment.create({
          data: {
            studentId: session.user.id,
            courseId: course.id,
            status: "ACTIVE",
            progress: 0,
          },
        });
      } else if (existingEnrollment.status !== "ACTIVE") {
        await db.enrollment.update({
          where: { id: existingEnrollment.id },
          data: { status: "ACTIVE" },
        });
      }
      redirect("/student/courses");
    }

    // Get bank details from CmsContent (admin settings)
    const bankRow = await db.cmsContent.findUnique({
      where: { key: "admin_settings_bank" },
    });
    if (bankRow?.value) {
      try {
        bankDetails = JSON.parse(bankRow.value);
      } catch {}
    }
    // Fallback to defaults
    if (!bankDetails) {
      bankDetails = {
        name: process.env.BANK_NAME || "البنك الأهلي السعودي",
        accountName: process.env.BANK_ACCOUNT_NAME || "أحمد زغلول - تصويرك",
        iban: process.env.BANK_IBAN || "SA00 0000 0000 0000 0000 0000",
        accountNumber: process.env.BANK_ACCOUNT_NUMBER || "0000000000000",
      };
    }
  } catch (err) {
    // If it was a redirect, rethrow it so Next.js handles it properly
    if (err instanceof Error && err.message === "NEXT_REDIRECT") {
      throw err;
    }
    // Next.js redirect throws a special redirect error, check for it
    if (err && (err as any).digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("[checkout] DB error:", err);
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <LandingNavbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <p className="text-muted-foreground">تعذّر تحميل صفحة الدفع. حاول مرة أخرى.</p>
        </main>
        <LandingFooter />
      </div>
    );
  }

  // If already enrolled and active, redirect to learning
  if (existingEnrollment?.status === "ACTIVE") {
    redirect("/student/courses");
  }

  const price = Number(course.discountPrice || course.price);
  const originalPrice = Number(course.price);
  const hasDiscount = course.discountPrice && Number(course.discountPrice) < Number(course.price);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LandingNavbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12 max-w-5xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/courses" className="hover:text-foreground">الدورات</Link>
            <span>/</span>
            <Link href={`/courses/${course.id}`} className="hover:text-foreground truncate">
              {course.titleAr || course.title}
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">إتمام التسجيل</span>
          </div>

          <h1 className={`text-2xl lg:text-3xl font-extrabold mb-6 ${brandGradientText}`}>
            إتمام التسجيل في الدورة
          </h1>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Course summary + Bank details + Upload form */}
            <div className="lg:col-span-2 space-y-4">
              {/* Course summary */}
              <Card className="rounded-2xl border-border/60">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-xl brand-gradient-soft border border-border/40 flex items-center justify-center shrink-0">
                      <FileImage className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-lg truncate">
                        {course.titleAr || course.title}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        {course.category || "تصوير"} · {course.durationHours} ساعة · {course.level === "BEGINNER" ? "مبتدئ" : course.level === "INTERMEDIATE" ? "متوسط" : "متقدّم"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bank details */}
              <Card className="rounded-2xl border-[#00A3AA]/30 bg-[#00A3AA]/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Banknote className="h-5 w-5 text-[#00A3AA]" />
                    بيانات الحساب للتحويل
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">البنك</div>
                      <div className="font-medium mt-0.5">{bankDetails.name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">اسم صاحب الحساب</div>
                      <div className="font-medium mt-0.5">{bankDetails.accountName}</div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-xs text-muted-foreground">رقم الآيبان (IBAN)</div>
                      <div className="font-mono font-semibold mt-0.5 tracking-wider text-base" dir="ltr">
                        {bankDetails.iban}
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(bankDetails.iban.replace(/\s/g, ""))}
                        className="text-xs text-[#0A9ED9] hover:underline mt-1"
                      >
                        نسخ رقم الآيبان
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upload form */}
              <CheckoutForm
                courseId={course.id}
                courseTitle={course.titleAr || course.title}
                amount={price}
                currency={course.currency}
                studentId={session.user.id}
                existingEnrollmentId={existingEnrollment?.id}
              />
            </div>

            {/* Right: Order summary */}
            <div className="lg:col-span-1">
              <Card className="rounded-2xl border-border/60 sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg">ملخص الطلب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">سعر الدورة</span>
                    <span className="font-medium">
                      {originalPrice.toLocaleString("ar-SA")} {course.currency}
                    </span>
                  </div>
                  {hasDiscount && (
                    <div className="flex items-center justify-between text-sm text-emerald-600">
                      <span>خصم</span>
                      <span className="font-medium">
                        -{(originalPrice - price).toLocaleString("ar-SA")} {course.currency}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-border/40 pt-3 flex items-center justify-between">
                    <span className="font-semibold">الإجمالي</span>
                    <span className="font-extrabold text-xl brand-gradient-text">
                      {price.toLocaleString("ar-SA")} {course.currency}
                    </span>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-border/40">
                    <div className="flex items-start gap-2 text-xs">
                      <ShieldCheck className="h-4 w-4 text-[#00A3AA] shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        دفع آمن عبر تحويل بنكي. سيتم تفعيل الدورة خلال 24 ساعة من اعتماد الإيصال.
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-xs">
                      <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        مدة المراجعة: 24 ساعة كحد أقصى. ستصل إشعار بالبريد عند الاعتماد.
                      </span>
                    </div>
                  </div>

                  {hasDiscount && (
                    <Badge className="bg-[#D65221]/10 text-[#D65221] w-full justify-center py-1.5">
                      عرض خاص! وفّر {(originalPrice - price).toLocaleString("ar-SA")} {course.currency}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
