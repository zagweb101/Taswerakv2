import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Gift, Copy, Users, Wallet, Share2 } from "lucide-react";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { brandGradientText } from "@/lib/brand";

export const dynamic = "force-dynamic";

export default async function StudentReferralsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "STUDENT") redirect(`/${session.user.role.toLowerCase()}`);

  let referralCode = "";
  let referrals: any[] = [];
  let credit = 0;

  try {
    const settings = await db.userSettings.findUnique({
      where: { userId: session.user.id },
    });
    if (settings?.data) {
      const data = settings.data as any;
      referralCode = data.referralCode || "";
      referrals = data.referrals || [];
      credit = data.credit || 0;
    }
  } catch {
    // DB unavailable
  }

  // Generate code if not exists
  if (!referralCode) {
    referralCode = `${(session.user.name || "TAS").replace(/\s/g, "").slice(0, 4).toUpperCase()}${session.user.id.slice(-4).toUpperCase()}`;
  }

  const referralLink = `${process.env.NEXTAUTH_URL || ""}/ref/${referralCode}`;

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="الإحالات"
        description="ادعُ أصدقاءك واحصل على 50 ر.س عند تسجيل كل صديق"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Card className="rounded-2xl border-border/40 bg-gradient-to-bl from-[#0A9ED9]/10 to-[#0A9ED9]/5">
          <CardContent className="p-4">
            <Users className="h-5 w-5 mb-2 text-[#0A9ED9]" />
            <div className="text-2xl font-bold">{referrals.length}</div>
            <div className="text-xs text-muted-foreground">أصدقاء دعوتهم</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/40 bg-gradient-to-bl from-[#D65221]/10 to-[#D65221]/5">
          <CardContent className="p-4">
            <Wallet className="h-5 w-5 mb-2 text-[#D65221]" />
            <div className="text-2xl font-bold">{credit}</div>
            <div className="text-xs text-muted-foreground">رصيدك (ر.س)</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/40 bg-gradient-to-bl from-[#00A3AA]/10 to-[#00A3AA]/5">
          <CardContent className="p-4">
            <Gift className="h-5 w-5 mb-2 text-[#00A3AA]" />
            <div className="text-2xl font-bold">50</div>
            <div className="text-xs text-muted-foreground">ر.س لكل صديق يسجّل</div>
          </CardContent>
        </Card>
      </div>

      {/* Referral link */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-[#0A9ED9]" />
            رابط الإحالة الخاص بك
          </CardTitle>
          <CardDescription>شارك هذا الرابط مع أصدقاءك — عند تسجيلهم تحصل على 50 ر.س</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30">
            <code className="flex-1 text-sm font-mono truncate" dir="ltr">{referralLink}</code>
            <Button
              size="sm"
              variant="outline"
              className="rounded-lg shrink-0"
              onClick={() => {
                navigator.clipboard.writeText(referralLink);
                toast.success("تم نسخ الرابط");
              }}
            >
              <Copy className="h-3.5 w-3.5 ml-1" /> نسخ
            </Button>
          </div>

          <div className="flex gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent("تعلّم التصوير مع تصويرك! سجّل عبر رابطي واحصل على خصم: " + referralLink)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button className="w-full rounded-xl bg-[#25D366] hover:bg-[#25D366]/90 text-white">
                <Share2 className="h-4 w-4 ml-1" /> مشاركة واتساب
              </Button>
            </a>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent("تعلّم التصوير مع تصويرك!")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="outline" className="w-full rounded-xl">
                <Share2 className="h-4 w-4 ml-1" /> تيليجرام
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Referrals list */}
      {referrals.length > 0 && (
        <Card className="rounded-2xl border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">الأصدقاء الذين دعوتهم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {referrals.map((r: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full brand-gradient flex items-center justify-center text-white font-bold text-sm">
                      {(r.name || "؟").charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{r.name || "صديق"}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.date ? new Date(r.date).toLocaleDateString("ar-SA") : ""}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-[#D65221]">+50 ر.س</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Need toast import for the copy button
import { toast } from "sonner";
