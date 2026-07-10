import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { brandGradientText } from "@/lib/brand";
import { Button } from "@/components/ui/button";

export default function DashboardNotFound() {
  return (
    <div className="text-center py-20">
      <div className="mx-auto h-16 w-16 rounded-2xl brand-gradient-soft border border-border/40 flex items-center justify-center mb-4">
        <Lock className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold mb-2">
        <span className={brandGradientText}>الصفحة غير موجودة</span>
      </h1>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        هذه الصفحة غير متوفرة في لوحة التحكم، أو لا تملك صلاحية الوصول إليها.
      </p>
      <Link href="/">
        <Button className="rounded-xl brand-gradient text-white hover:opacity-90">
          <ArrowLeft className="h-4 w-4 ml-1" />
          العودة للوحة التحكم
        </Button>
      </Link>
    </div>
  );
}
