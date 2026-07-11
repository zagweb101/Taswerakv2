"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Clock, FileImage, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AttentionItem {
  type: "STUCK_PAYMENT" | "LOW_PROGRESS" | "PENDING_CRITIQUE";
  studentId: string;
  studentName: string;
  courseName: string;
  detail: string;
  link: string;
  daysSince: number;
}

const typeMeta: Record<string, { icon: any; color: string; label: string }> = {
  STUCK_PAYMENT: { icon: Clock, color: "text-amber-600 bg-amber-100", label: "دفعة معلّقة" },
  LOW_PROGRESS: { icon: TrendingDown, color: "text-[#D65221] bg-[#D65221]/10", label: "تقدّم بطيء" },
  PENDING_CRITIQUE: { icon: FileImage, color: "text-[#00A3AA] bg-[#00A3AA]/10", label: "بانتظار النقد" },
};

export function StudentsNeedingAttention({ instructorId, role }: { instructorId: string; role: string }) {
  const [items, setItems] = useState<AttentionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/instructor/students-needing-attention")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          const all = [
            ...(data.pendingSubmissions || []),
            ...(data.stuckPayments || []),
            ...(data.lowProgress || []),
          ];
          setItems(all);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card className="rounded-2xl border-border/60">
        <CardContent className="p-5">
          <div className="h-6 w-1/3 skeleton-shimmer rounded-lg mb-3" />
          <div className="h-12 w-full skeleton-shimmer rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) return null;

  return (
    <Card className="rounded-2xl border-amber-200/60 bg-amber-50/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          طلاب يحتاجون اهتمامك ({items.length})
        </CardTitle>
        <CardDescription>
          هؤلاء الطلاب بحاجة لإجراء منك — انتقاد، اعتماد دفعة، أو متابعة
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto nice-scroll">
          {items.map((item, i) => {
            const meta = typeMeta[item.type] || typeMeta.LOW_PROGRESS;
            const Icon = meta.icon;
            return (
              <Link
                key={i}
                href={item.link}
                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/40 hover:shadow-md transition-shadow"
              >
                <div className={`h-9 w-9 rounded-lg ${meta.color} flex items-center justify-center shrink-0`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{item.studentName}</span>
                    <Badge variant="outline" className="text-[10px]">{meta.label}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">
                    {item.courseName} — {item.detail}
                  </div>
                </div>
                {item.daysSince > 3 && (
                  <Badge className="bg-red-100 text-red-700 text-[10px] shrink-0">
                    {item.daysSince} يوم
                  </Badge>
                )}
                <ArrowLeft className="h-4 w-4 text-muted-foreground shrink-0" />
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
