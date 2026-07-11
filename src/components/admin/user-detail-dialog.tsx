"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Wallet,
  Award,
  Loader2,
} from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isBanned: boolean;
  createdAt: Date;
  _count?: { enrollments: number; coursesAsInstructor: number };
}

interface UserDetail {
  user: User;
  enrollments: Array<{
    id: string;
    status: string;
    progress: number;
    enrolledAt: string;
    course: { titleAr: string | null; title: string };
  }>;
  payments: Array<{
    id: string;
    amount: any;
    currency: string;
    status: string;
    bankName: string;
    referenceNumber: string | null;
    createdAt: string;
    enrollment: { course: { titleAr: string | null; title: string } };
  }>;
  certificates: Array<{
    id: string;
    certificateNumber: string;
    issuedAt: string;
    grade: string | null;
    course: { titleAr: string | null; title: string };
  }>;
}

const roleMap: Record<string, { label: string; cls: string }> = {
  STUDENT: { label: "طالب", cls: "bg-blue-100 text-blue-700" },
  INSTRUCTOR: { label: "مدرّب", cls: "bg-teal-100 text-teal-700" },
  ADMIN: { label: "مدير", cls: "bg-orange-100 text-orange-700" },
};

export function UserDetailDialog({
  user,
  open,
  onOpenChange,
}: {
  user: User | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = (u: User) => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/users/${u.id}/detail`);
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error || "فشل التحميل");
        }
        setDetail(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setDetail(null);
      }
    });
  };

  // Fetch when dialog opens
  useEffect(() => {
    if (open && user && !detail && !pending && !error) {
      fetchDetail(user);
    }
  }, [open, user, detail, pending, error]);

  // Reset when dialog closes
  useEffect(() => {
    if (!open && (detail || error)) {
      setDetail(null);
      setError(null);
    }
  }, [open, detail, error]);

  if (!user) return null;

  const role = roleMap[user.role] || { label: user.role, cls: "bg-muted" };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto nice-scroll">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="brand-gradient-soft font-semibold">
                {(user.name || "؟").charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="truncate">{user.name || "—"}</div>
              <div className="text-xs font-normal text-muted-foreground" dir="ltr">
                {user.email}
              </div>
            </div>
            <Badge className={role.cls}>{role.label}</Badge>
            {user.isBanned && (
              <Badge className="bg-red-100 text-red-700">موقوف</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {pending ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-sm text-red-600">
            {error}
          </div>
        ) : detail ? (
          <div className="space-y-4">
            {/* Contact info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {detail.user && (
                <>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">البريد:</span>
                    <span className="font-medium truncate" dir="ltr">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">انضم:</span>
                    <span className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString("ar-SA")}
                    </span>
                  </div>
                </>
              )}
            </div>

            <Separator />

            {/* Enrollments */}
            <div>
              <h4 className="text-sm font-bold mb-2 flex items-center gap-1">
                <BookOpen className="h-4 w-4 text-[#0A9ED9]" />
                التسجيلات ({detail.enrollments.length})
              </h4>
              {detail.enrollments.length === 0 ? (
                <p className="text-xs text-muted-foreground">لا توجد تسجيلات</p>
              ) : (
                <div className="space-y-1.5">
                  {detail.enrollments.map((e) => (
                    <div key={e.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-xs">
                      <span className="font-medium truncate flex-1">
                        {e.course.titleAr || e.course.title}
                      </span>
                      <Badge variant="outline" className="ml-2 shrink-0">{e.status}</Badge>
                      <span className="text-muted-foreground ml-2 shrink-0">
                        {Math.round(e.progress)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Payments */}
            <div>
              <h4 className="text-sm font-bold mb-2 flex items-center gap-1">
                <Wallet className="h-4 w-4 text-[#00A3AA]" />
                المدفوعات ({detail.payments.length})
              </h4>
              {detail.payments.length === 0 ? (
                <p className="text-xs text-muted-foreground">لا توجد مدفوعات</p>
              ) : (
                <div className="space-y-1.5">
                  {detail.payments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-xs">
                      <span className="truncate flex-1">
                        {p.enrollment?.course?.titleAr || p.enrollment?.course?.title}
                      </span>
                      <span className="font-semibold ml-2 shrink-0">
                        {Number(p.amount).toLocaleString("ar-SA")} {p.currency}
                      </span>
                      <Badge variant="outline" className="ml-2 shrink-0">{p.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Certificates */}
            <div>
              <h4 className="text-sm font-bold mb-2 flex items-center gap-1">
                <Award className="h-4 w-4 text-[#D65221]" />
                الشهادات ({detail.certificates.length})
              </h4>
              {detail.certificates.length === 0 ? (
                <p className="text-xs text-muted-foreground">لا توجد شهادات</p>
              ) : (
                <div className="space-y-1.5">
                  {detail.certificates.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-xs">
                      <span className="truncate flex-1">
                        {c.course.titleAr || c.course.title}
                      </span>
                      <span className="font-mono text-muted-foreground ml-2 shrink-0" dir="ltr">
                        {c.certificateNumber}
                      </span>
                      {c.grade && (
                        <Badge variant="outline" className="ml-2 shrink-0">{c.grade}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
