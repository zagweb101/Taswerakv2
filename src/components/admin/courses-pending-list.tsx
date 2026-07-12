"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Check, X, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface PendingCourse {
  id: string;
  title: string;
  titleAr: string | null;
  description: string;
  isFree: boolean;
  price: any;
  currency: string;
  submittedAt: Date | string | null;
  instructor: {
    name: string | null;
    email: string;
  };
  _count: {
    sections: number;
  };
}

interface Props {
  courses: PendingCourse[];
}

export function CoursesPendingList({ courses: initialCourses }: Props) {
  const router = useRouter();
  const [courses, setCourses] = useState<PendingCourse[]>(initialCourses);
  const [pending, startTransition] = useTransition();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const handleReview = async (id: string, action: "APPROVE" | "REJECT", rejectionReason?: string) => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/courses/${id}/review`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, rejectionReason }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || "حدث خطأ أثناء معالجة الطلب");

        toast.success(action === "APPROVE" ? "تم قبول ونشر الدورة بنجاح" : "تم رفض الدورة وإعادتها للمدرس");
        setCourses(courses.filter((c) => c.id !== id));
        setRejectId(null);
        setReason("");
        router.refresh();
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  return (
    <div className="space-y-4">
      {courses.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-2 py-12 text-center">
          <CardContent className="space-y-3">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/60" />
            <div className="font-semibold text-lg text-muted-foreground">لا توجد دورات معلقة للمراجعة</div>
            <p className="text-sm text-muted-foreground/80 max-w-md mx-auto">
              عندما يقوم المدرسون بتقديم دوراتهم للمراجعة، ستظهر طلبات الاعتماد هنا.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <Card key={course.id} className="rounded-2xl border-border/60 overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      قيد المراجعة
                    </Badge>
                    <Badge variant="secondary" className="rounded-md">
                      {course.isFree ? "مجانية" : `${Number(course.price)} ${course.currency}`}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {course._count.sections} أقسام
                    </span>
                  </div>

                  <h3 className="font-bold text-lg md:text-xl truncate text-foreground">
                    {course.titleAr || course.title}
                  </h3>

                  <div className="text-sm text-muted-foreground">
                    <span>المدرس: </span>
                    <strong className="text-foreground">{course.instructor.name || "مدرس غير معروف"}</strong>
                    <span className="mx-2">·</span>
                    <span>{course.instructor.email}</span>
                    {course.submittedAt && (
                      <>
                        <span className="mx-2">·</span>
                        <span>تاريخ التقديم: {new Date(course.submittedAt).toLocaleDateString("ar-SA")}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <Button
                    onClick={() => handleReview(course.id, "APPROVE")}
                    disabled={pending}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                  >
                    {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 ml-1" />}
                    قبول ونشر
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setRejectId(course.id)}
                    disabled={pending}
                    className="rounded-xl"
                  >
                    <X className="h-4 w-4 ml-1" />
                    رفض
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Rejection Dialog */}
      <Dialog open={rejectId !== null} onOpenChange={(open) => !open && setRejectId(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              رفض طلب نشر الدورة
            </DialogTitle>
            <DialogDescription>
              يرجى توضيح سبب رفض الدورة للمدرس ليتمكن من تصحيح الأخطاء وإعادة تقديم الطلب.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-4">
            <Label htmlFor="reason" className="text-right">سبب الرفض *</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثال: يرجى إضافة مقطع فيديو تعريفي وتعديل أسماء الدروس لتكون واضحة..."
              className="rounded-xl"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setRejectId(null);
                setReason("");
              }}
              disabled={pending}
              className="rounded-xl"
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={() => rejectId && handleReview(rejectId, "REJECT", reason)}
              disabled={pending || !reason.trim()}
              className="rounded-xl"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 ml-1" />}
              تأكيد الرفض
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
