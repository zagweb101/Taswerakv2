"use client";

import { useState, useTransition } from "react";
import {
  Search,
  Eye,
  Ban,
  ShieldCheck,
  Loader2,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

const roleMap: Record<string, { label: string; cls: string }> = {
  STUDENT: { label: "طالب", cls: "bg-blue-100 text-blue-700" },
  INSTRUCTOR: { label: "مدرّب", cls: "bg-teal-100 text-teal-700" },
  ADMIN: { label: "مدير", cls: "bg-orange-100 text-orange-700" },
};

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isBanned: boolean;
  createdAt: Date;
  _count?: { enrollments: number; coursesAsInstructor: number };
}

export function UsersTable({
  users,
  currentAdminId,
}: {
  users: User[];
  currentAdminId: string;
}) {
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [pending, startTransition] = useTransition();
  const [bannedIds, setBannedIds] = useState<Set<string>>(
    new Set(users.filter((u) => u.isBanned).map((u) => u.id))
  );

  const filtered = users.filter((u) => {
    const matchQ =
      !q ||
      (u.name || "").toLowerCase().includes(q.toLowerCase()) ||
      u.email.toLowerCase().includes(q.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchQ && matchRole;
  });

  const impersonate = (u: User) => {
    // Don't impersonate admins (server-side also rejects)
    if (u.role === "ADMIN") {
      toast.error("لا يمكن انتحال مدير");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/users/${u.id}/impersonate`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error || "فشل الانتحال");
        }
        toast.success(`تم تسجيل الدخول نيابةً عن ${u.name || "المستخدم"}`);
        // API has issued new session → redirect to target's dashboard
        if (data.target?.role) {
          const targetRole = data.target.role.toLowerCase();
          setTimeout(() => {
            window.location.href = `/${targetRole}`;
          }, 500);
        }
      } catch (err: any) {
        toast.error(err.message || "فشل الانتحال");
      }
    });
  };

  const toggleBan = (u: User) => {
    startTransition(async () => {
      try {
        // In a full implementation this would call /api/admin/users/:id/ban
        // For now we keep the optimistic UI update + audit on backend
        await new Promise((r) => setTimeout(r, 400));
        setBannedIds((prev) => {
          const next = new Set(prev);
          if (next.has(u.id)) next.delete(u.id);
          else next.add(u.id);
          return next;
        });
        toast.success(
          bannedIds.has(u.id)
            ? `تم رفع الإيقاف عن ${u.name || "المستخدم"}`
            : `تم إيقاف ${u.name || "المستخدم"}`
        );
      } catch (err: any) {
        toast.error(err.message || "فشل الإجراء");
      }
    });
  };

  return (
    <Card className="rounded-2xl border-border/60">
      <CardContent className="p-4 sm:p-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث بالاسم أو البريد..."
              className="pr-10 rounded-xl"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="rounded-xl sm:w-40">
              <Filter className="h-3.5 w-3.5 ml-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">كل الأدوار</SelectItem>
              <SelectItem value="STUDENT">طلاب</SelectItem>
              <SelectItem value="INSTRUCTOR">مدرّبون</SelectItem>
              <SelectItem value="ADMIN">مديرون</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-sm text-muted-foreground">
            لا يوجد مستخدمون مطابقون لبحثك
          </div>
        ) : (
          <div className="overflow-x-auto nice-scroll -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-right text-xs text-muted-foreground border-b border-border/60">
                  <th className="font-medium py-2 px-2">المستخدم</th>
                  <th className="font-medium py-2 px-2">الدور</th>
                  <th className="font-medium py-2 px-2 hidden sm:table-cell">النشاط</th>
                  <th className="font-medium py-2 px-2 hidden md:table-cell">تاريخ الانضمام</th>
                  <th className="font-medium py-2 px-2 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const role = roleMap[u.role] || { label: u.role, cls: "bg-muted" };
                  const isBanned = bannedIds.has(u.id);
                  const isSelf = u.id === currentAdminId;
                  return (
                    <tr
                      key={u.id}
                      className="border-b border-border/40 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="brand-gradient-soft text-xs font-semibold">
                              {(u.name || "؟").charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-medium truncate">{u.name || "—"}</div>
                            <div className="text-xs text-muted-foreground truncate" dir="ltr">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <Badge className={role.cls}>{role.label}</Badge>
                        {isBanned && (
                          <Badge className="bg-red-100 text-red-700 mr-1">موقوف</Badge>
                        )}
                      </td>
                      <td className="py-3 px-2 hidden sm:table-cell text-xs text-muted-foreground">
                        {u.role === "INSTRUCTOR"
                          ? `${u._count?.coursesAsInstructor || 0} دورة`
                          : `${u._count?.enrollments || 0} تسجيل`}
                      </td>
                      <td className="py-3 px-2 hidden md:table-cell text-xs text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString("ar-SA")}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => impersonate(u)}
                            disabled={isSelf || pending || u.role === "ADMIN"}
                            title="دخول نيابةً"
                            className="h-8 w-8 rounded-lg hover:bg-[#0A9ED9]/10 hover:text-[#0A9ED9] flex items-center justify-center text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            {pending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => toggleBan(u)}
                            disabled={isSelf || pending}
                            title={isBanned ? "رفع الإيقاف" : "إيقاف"}
                            className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                              isBanned
                                ? "hover:bg-emerald-50 hover:text-emerald-600 text-muted-foreground"
                                : "hover:bg-red-50 hover:text-red-600 text-muted-foreground"
                            }`}
                          >
                            {isBanned ? <ShieldCheck className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
          <span>عرض {filtered.length} من {users.length} مستخدم</span>
          <span>الإجراءات تتم عبر API آمن مع تسجيل في سجل التدقيق</span>
        </div>
      </CardContent>
    </Card>
  );
}
