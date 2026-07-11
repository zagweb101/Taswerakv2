import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Bell, Clock, Award, Wallet, BookOpen, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { DashboardEmptyState } from "@/components/dashboard/empty-state";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/helpers";

export const dynamic = "force-dynamic";

const typeMeta: Record<string, { icon: React.ElementType; tint: string; iconColor: string }> = {
  PAYMENT_APPROVED: { icon: Wallet, tint: "bg-emerald-50", iconColor: "text-emerald-600" },
  PAYMENT_REJECTED: { icon: Wallet, tint: "bg-red-50", iconColor: "text-red-600" },
  CRITIQUE_RECEIVED: { icon: BookOpen, tint: "bg-[#0A9ED9]/10", iconColor: "text-[#0A9ED9]" },
  CERTIFICATE_ISSUED: { icon: Award, tint: "bg-[#D65221]/10", iconColor: "text-[#D65221]" },
  COURSE_UPDATE: { icon: BookOpen, tint: "bg-[#00A3AA]/10", iconColor: "text-[#00A3AA]" },
  SYSTEM: { icon: Bell, tint: "bg-muted", iconColor: "text-muted-foreground" },
};

export default async function InstructorNotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
    redirect(`/${session.user.role.toLowerCase()}`);
  }

  let notifications: any[] = [];
  let dbError = false;
  try {
    notifications = await db.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch (err) {
    console.error("[instructor/notifications] DB error:", err);
    dbError = true;
  }

  const unread = notifications.filter((n) => !n.readAt);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="الإشعارات"
        description={unread.length > 0 ? `لديك ${unread.length} إشعار غير مقروء` : "كل إشعاراتك مقروءة"}
      />

      {notifications.length === 0 ? (
        <Card className="rounded-2xl border-border/60">
          <CardContent>
            <DashboardEmptyState
              icon={<Bell className="h-6 w-6" />}
              title="لا توجد إشعارات"
              hint="ستظهر هنا تحديثات المدفوعات والنقد والدورات"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const meta = typeMeta[n.type] || typeMeta.SYSTEM;
            const Icon = meta.icon;
            const isUnread = !n.readAt;
            return (
              <Card
                key={n.id}
                className={cn(
                  "rounded-2xl border-border/60 transition-colors",
                  isUnread && "border-r-4 border-r-[#0A9ED9]"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", meta.tint)}>
                      <Icon className={cn("h-5 w-5", meta.iconColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{n.title}</span>
                        {isUnread && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#0A9ED9] shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {n.body}
                      </p>
                      <div className="text-xs text-muted-foreground/70 mt-2 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(new Date(n.createdAt))}
                      </div>
                    </div>
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
