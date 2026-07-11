import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

const statusMap: Record<string, { label: string; cls: string }> = {
  OPEN: { label: "مفتوحة", cls: "bg-blue-100 text-blue-700" },
  IN_PROGRESS: { label: "قيد المعالجة", cls: "bg-amber-100 text-amber-700" },
  RESOLVED: { label: "تم الحل", cls: "bg-emerald-100 text-emerald-700" },
  CLOSED: { label: "مغلقة", cls: "bg-zinc-100 text-zinc-600" },
};

export default async function AdminSupportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/admin");

  let tickets: any[] = [];
  let dbError = false;
  try {
    tickets = await db.supportTicket.findMany({
      include: {
        student: { select: { name: true, email: true } },
        course: { select: { titleAr: true, title: true } },
        _count: { select: { replies: true } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 50,
    });
  } catch {
    dbError = true;
  }

  const openCount = tickets.filter((t) => t.status === "OPEN").length;

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="تذاكر الدعم"
        description={openCount > 0 ? `${openCount} تذكرة مفتوحة بانتظارك` : "كل التذاكر مغلقة"}
      />

      {dbError ? (
        <Card className="rounded-2xl border-border/60">
          <CardContent className="p-6 text-center text-muted-foreground">
            تعذّر تحميل التذاكر
          </CardContent>
        </Card>
      ) : tickets.length === 0 ? (
        <Card className="rounded-2xl border-border/60">
          <CardContent className="p-10 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="font-semibold mb-1">لا توجد تذاكر دعم</p>
            <p className="text-sm text-muted-foreground">عندما يفتح الطلاب تذاكر، ستظهر هنا</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => {
            const st = statusMap[t.status] || statusMap.OPEN;
            return (
              <Card key={t.id} className="rounded-2xl border-border/60">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{t.subject}</span>
                        <Badge className={st.cls}>{st.label}</Badge>
                        <Badge variant="outline">{t.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.body}</p>
                      <div className="text-xs text-muted-foreground mt-2 flex items-center gap-3">
                        <span>{t.student?.name}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(t.createdAt).toLocaleDateString("ar-SA")}
                        </span>
                        {t._count?.replies > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {t._count.replies} رد
                          </span>
                        )}
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
