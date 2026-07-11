import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Bell, CheckCircle2, Clock, Award, Wallet, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { DashboardEmptyState } from "@/components/dashboard/empty-state";
import { MarkReadButton } from "@/components/student/mark-read-button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const mockNotifications = [
  {
    id: "n1",
    type: "PAYMENT_APPROVED",
    title: "تم اعتماد دفعتك",
    body: "تم اعتماد إيصال الدفع لدورة تصوير البيوتي. يمكنك الآن البدء في الدورة.",
    readAt: null,
    createdAt: new Date("2026-07-09T10:00:00"),
  },
  {
    id: "n2",
    type: "CRITIQUE_RECEIVED",
    title: "نقد جديد على عملك",
    body: "أضاف الأستاذ أحمد نقداً تفصيلياً على صورتك الأخيرة في وحدة الإضاءة.",
    readAt: null,
    createdAt: new Date("2026-07-08T14:30:00"),
  },
  {
    id: "n3",
    type: "CERTIFICATE_ISSUED",
    title: "شهادتك جاهزة",
    body: "تم إصدار شهادة إتمام دورة أساسيات التصوير. حمّلها الآن من قسم شهاداتي.",
    readAt: new Date("2026-05-15T09:00:00"),
    createdAt: new Date("2026-05-15T09:00:00"),
  },
];

const typeMeta: Record<string, { icon: React.ElementType; tint: string; iconColor: string }> = {
  PAYMENT_APPROVED: { icon: Wallet, tint: "bg-emerald-50", iconColor: "text-emerald-600" },
  PAYMENT_REJECTED: { icon: Wallet, tint: "bg-red-50", iconColor: "text-red-600" },
  CRITIQUE_RECEIVED: { icon: BookOpen, tint: "bg-[#0A9ED9]/10", iconColor: "text-[#0A9ED9]" },
  CERTIFICATE_ISSUED: { icon: Award, tint: "bg-[#D65221]/10", iconColor: "text-[#D65221]" },
  COURSE_UPDATE: { icon: BookOpen, tint: "bg-[#00A3AA]/10", iconColor: "text-[#00A3AA]" },
  SYSTEM: { icon: Bell, tint: "bg-muted", iconColor: "text-muted-foreground" },
};

export default async function StudentNotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  let notifications: any[] = [];
  try {
    notifications = await db.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch {
    notifications = mockNotifications;
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
              hint="ستظهر هنا تحديثات المدفوعات والنقد والشهادات"
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
                    {isUnread && (
                      <MarkReadButton notificationId={n.id} />
                    )}
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

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (day > 0) return `منذ ${day} يوم`;
  if (hr > 0) return `منذ ${hr} ساعة`;
  if (min > 0) return `منذ ${min} دقيقة`;
  return "الآن";
}
