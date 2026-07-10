import Link from "next/link";
import { Home, ArrowLeft, Camera } from "lucide-react";
import { brandGradientText } from "@/lib/brand";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-bl from-[#0A9ED9]/8 via-[#00A3AA]/5 to-[#D65221]/8" />
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-[#0A9ED9]/15 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-[#D65221]/15 rounded-full blur-3xl -z-10" />

      <div className="text-center max-w-md mx-auto space-y-6">
        <div className="relative mx-auto h-32 w-32">
          <div className="absolute inset-0 rounded-full brand-gradient opacity-20 blur-2xl" />
          <div className="relative h-full w-full rounded-3xl glass border-white/60 shadow-2xl flex flex-col items-center justify-center">
            <Camera className="h-10 w-10 text-[#0A9ED9]" />
            <div className={`text-3xl font-extrabold mt-1 ${brandGradientText}`}>
              ٤٠٤
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold">
            <span className={brandGradientText}>الصفحة غير موجودة</span>
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            يبدو أن الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
            تحقق من الرابط أو ارجع للصفحة الرئيسية.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/">
            <Button className="rounded-xl brand-gradient text-white hover:opacity-90 h-11 px-6">
              <Home className="h-4 w-4 ml-1" />
              الصفحة الرئيسية
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="rounded-xl h-11">
              <ArrowLeft className="h-4 w-4 ml-1" />
              تسجيل الدخول
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
