import Link from "next/link";
import { Wrench, ArrowLeft } from "lucide-react";
import { brandGradientText } from "@/lib/brand";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function MaintenancePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-bl from-amber-50/50 via-background to-[#D65221]/8" />
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl -z-10" />

      <div className="text-center max-w-md mx-auto space-y-6">
        <div className="relative mx-auto h-32 w-32">
          <div className="absolute inset-0 rounded-full bg-amber-200 opacity-40 blur-2xl" />
          <div className="relative h-full w-full rounded-3xl bg-white border border-amber-200 shadow-2xl flex flex-col items-center justify-center">
            <Wrench className="h-12 w-12 text-amber-500 animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold">
            <span className={brandGradientText}>تحت الصيانة</span>
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            نحن نعمل على تحسين المنصة لتقديم تجربة تعلّم أفضل.
            سنعود قريباً — شكراً لصبركم! 🙏
          </p>
        </div>

        <Link href="/">
          <Button variant="outline" className="rounded-xl h-11">
            <ArrowLeft className="h-4 w-4 ml-1" />
            العودة للرئيسية
          </Button>
        </Link>
      </div>
    </main>
  );
}
