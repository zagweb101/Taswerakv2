import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  Users as UsersIcon,
  Search,
  Shield,
  Eye,
  Ban,
  UserPlus,
  Filter,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { UsersTable } from "@/components/admin/users-table";

export const dynamic = "force-dynamic";

const mockUsers = [
  { id: "u1", name: "أحمد زغلول", email: "ahmed@taswerak.com", role: "INSTRUCTOR", isBanned: false, createdAt: new Date("2026-01-01"), _count: { enrollments: 0, coursesAsInstructor: 3 } },
  { id: "u2", name: "صفاء العتيبي", email: "safaa@example.com", role: "STUDENT", isBanned: false, createdAt: new Date("2026-05-12"), _count: { enrollments: 2, coursesAsInstructor: 0 } },
  { id: "u3", name: "أماني بخش", email: "amani@example.com", role: "STUDENT", isBanned: false, createdAt: new Date("2026-05-20"), _count: { enrollments: 3, coursesAsInstructor: 0 } },
  { id: "u4", name: "المها اليازيدي", email: "almaha@example.com", role: "STUDENT", isBanned: false, createdAt: new Date("2026-06-01"), _count: { enrollments: 1, coursesAsInstructor: 0 } },
  { id: "u5", name: "نورة القحطاني", email: "noura@example.com", role: "STUDENT", isBanned: true, createdAt: new Date("2026-06-15"), _count: { enrollments: 1, coursesAsInstructor: 0 } },
  { id: "u6", name: "مدير النظام", email: "admin@taswerak.com", role: "ADMIN", isBanned: false, createdAt: new Date("2026-01-01"), _count: { enrollments: 0, coursesAsInstructor: 0 } },
];

const roleMap: Record<string, { label: string; cls: string }> = {
  STUDENT: { label: "طالب", cls: "bg-blue-100 text-blue-700" },
  INSTRUCTOR: { label: "مدرّب", cls: "bg-teal-100 text-teal-700" },
  ADMIN: { label: "مدير", cls: "bg-orange-100 text-orange-700" },
};

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const users = await db.user.findMany({
    include: { _count: { select: { enrollments: true, coursesAsInstructor: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const [total, students, instructors, banned] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: "STUDENT" } }),
    db.user.count({ where: { role: "INSTRUCTOR" } }),
    db.user.count({ where: { isBanned: true } }),
  ]);
  const stats = { total, students, instructors, banned };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="المستخدمون"
        description="أدِر حسابات الطلاب والمدرّبين والمديرين"
        actions={
          <Button className="rounded-xl brand-gradient text-white hover:opacity-90">
            <UserPlus className="h-4 w-4 ml-1" />
            مستخدم جديد
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="rounded-2xl border-border/40 bg-gradient-to-bl from-[#0A9ED9]/10 to-[#0A9ED9]/5">
          <CardContent className="p-4">
            <UsersIcon className="h-5 w-5 mb-2 text-[#0A9ED9]" />
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">إجمالي المستخدمين</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/40 bg-gradient-to-bl from-[#00A3AA]/10 to-[#00A3AA]/5">
          <CardContent className="p-4">
            <UsersIcon className="h-5 w-5 mb-2 text-[#00A3AA]" />
            <div className="text-2xl font-bold">{stats.students}</div>
            <div className="text-xs text-muted-foreground">طلاب</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/40 bg-gradient-to-bl from-purple-100 to-purple-50">
          <CardContent className="p-4">
            <UsersIcon className="h-5 w-5 mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{stats.instructors}</div>
            <div className="text-xs text-muted-foreground">مدرّبون</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/40 bg-gradient-to-bl from-red-100 to-red-50">
          <CardContent className="p-4">
            <Ban className="h-5 w-5 mb-2 text-red-600" />
            <div className="text-2xl font-bold">{stats.banned}</div>
            <div className="text-xs text-muted-foreground">موقوفون</div>
          </CardContent>
        </Card>
      </div>

      {/* Users table */}
      <UsersTable users={users} currentAdminId={session.user.id} />
    </div>
  );
}

export { roleMap };
