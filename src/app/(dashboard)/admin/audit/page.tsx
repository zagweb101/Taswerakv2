import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  ScrollText,
  LogIn,
  Wallet,
  Pencil,
  Trash2,
  ShieldCheck,
  Search,
  Filter,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardPageHeader } from "@/components/dashboard/page-header";

export const dynamic = "force-dynamic";

const mockLogs = [
  { id: "l1", userId: "u6", action: "PAYMENT_APPROVE", entity: "PaymentReceipt", entityId: "pr1", metadata: { amount: 899, student: "صفاء العتيبي" }, ipAddress: "192.168.1.1", createdAt: new Date("2026-07-09T11:30:00"), user: { name: "أحمد زغلول" } },
  { id: "l2", userId: "u1", action: "LOGIN", entity: "User", entityId: "u1", metadata: null, ipAddress: "192.168.1.2", createdAt: new Date("2026-07-09T10:00:00"), user: { name: "أحمد زغلول" } },
  { id: "l3", userId: "u6", action: "USER_BAN", entity: "User", entityId: "u5", metadata: { name: "نورة القحطاني" }, ipAddress: "192.168.1.1", createdAt: new Date("2026-07-08T15:20:00"), user: { name: "مدير النظام" } },
  { id: "l4", userId: "u1", action: "COURSE_UPDATE", entity: "Course", entityId: "c1", metadata: { title: "تصوير البيوتي", field: "price" }, ipAddress: "192.168.1.2", createdAt: new Date("2026-07-08T13:00:00"), user: { name: "أحمد زغلول" } },
  { id: "l5", userId: "u6", action: "PAYMENT_REJECT", entity: "PaymentReceipt", entityId: "pr2", metadata: { amount: 499, reason: "المبلغ غير مطابق" }, ipAddress: "192.168.1.1", createdAt: new Date("2026-07-07T16:00:00"), user: { name: "مدير النظام" } },
  { id: "l6", userId: "u1", action: "LOGIN_FAILED", entity: "User", entityId: null, metadata: { email: "test@test.com" }, ipAddress: "10.0.0.5", createdAt: new Date("2026-07-07T09:00:00"), user: null },
];

const actionMeta: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
  LOGIN: { label: "تسجيل دخول", icon: LogIn, cls: "bg-blue-100 text-blue-700" },
  LOGIN_FAILED: { label: "محاولة فاشلة", icon: LogIn, cls: "bg-red-100 text-red-700" },
  PAYMENT_APPROVE: { label: "اعتماد دفع", icon: Wallet, cls: "bg-emerald-100 text-emerald-700" },
  PAYMENT_REJECT: { label: "رفض دفع", icon: Wallet, cls: "bg-red-100 text-red-700" },
  COURSE_UPDATE: { label: "تعديل دورة", icon: Pencil, cls: "bg-amber-100 text-amber-700" },
  COURSE_DELETE: { label: "حذف دورة", icon: Trash2, cls: "bg-red-100 text-red-700" },
  USER_BAN: { label: "إيقاف مستخدم", icon: ShieldCheck, cls: "bg-red-100 text-red-700" },
  USER_UNBAN: { label: "رفع إيقاف", icon: ShieldCheck, cls: "bg-emerald-100 text-emerald-700" },
};

export default async function AdminAuditPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  let logs: any[] = [];
  let dbError = false;
  try {
    logs = await db.auditLog.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch (err) {
    console.error("[audit-page] DB error:", err);
    dbError = true;
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="سجل التدقيق"
        description="كل الأحداث المهمة في النظام — مرتبة زمنياً"
      />

      {/* Filters */}
      <Card className="rounded-2xl border-border/60">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث في السجل (مستخدم، إجراء، IP)..."
                className="pr-10 rounded-xl"
              />
            </div>
            <Select defaultValue="ALL">
              <SelectTrigger className="rounded-xl sm:w-48">
                <Filter className="h-3.5 w-3.5 ml-1" />
                <SelectValue placeholder="كل الإجراءات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">كل الإجراءات</SelectItem>
                <SelectItem value="AUTH">المصادقة</SelectItem>
                <SelectItem value="PAYMENT">المدفوعات</SelectItem>
                <SelectItem value="CONTENT">المحتوى</SelectItem>
                <SelectItem value="USER">المستخدمون</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-[#0A9ED9]" />
            آخر {logs.length} حدث
          </CardTitle>
          <CardDescription>يتم تسجيل كل إجراء حساس تلقائياً</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground">
              {dbError
                ? "تعذّر تحميل السجل — تحقق من اتصال قاعدة البيانات"
                : "لا توجد أحداث مسجّلة بعد — ستظهر هنا الإجراءات الحساسة (تسجيل دخول، اعتماد مدفوعات، تعديلات، إلخ)"}
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute top-0 bottom-0 right-5 w-px bg-border" />

              <div className="space-y-4">
                {logs.map((log) => {
                  const meta = actionMeta[log.action] || {
                    label: log.action,
                    icon: ScrollText,
                    cls: "bg-muted text-muted-foreground",
                  };
                  const Icon = meta.icon;
                  return (
                    <div key={log.id} className="relative pr-12">
                      {/* Timeline dot */}
                      <div className={`absolute right-3 top-1 h-5 w-5 rounded-full ${meta.cls} border-2 border-background flex items-center justify-center`}>
                        <Icon className="h-2.5 w-2.5" />
                      </div>

                      <div className="p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            {log.user ? (
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="text-[10px] font-semibold brand-gradient-soft">
                                  {log.user.name?.charAt(0) || "؟"}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-[10px] text-muted-foreground">؟</span>
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium">
                                {log.user?.name || "مستخدم مجهول"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(log.createdAt).toLocaleString("ar-SA")}
                              </div>
                            </div>
                          </div>
                          <Badge className={meta.cls}>{meta.label}</Badge>
                        </div>

                        <div className="mt-2 text-xs text-muted-foreground">
                          <span>الكيان: <span className="font-mono">{log.entity}</span></span>
                          {log.entityId && (
                            <span className="mr-3">المعرف: <span className="font-mono">{log.entityId.slice(0, 8)}</span></span>
                          )}
                          {log.ipAddress && (
                            <span className="mr-3" dir="ltr">IP: {log.ipAddress}</span>
                          )}
                        </div>

                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <div className="mt-2 p-2 rounded-lg bg-background/60 text-xs">
                            <pre className="text-muted-foreground overflow-x-auto nice-scroll" dir="ltr">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
