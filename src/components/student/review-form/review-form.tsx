"use client";

import { useState, useTransition } from "react";
import { Star, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  courseId: string;
  existingReview?: { id: string; rating: number; comment: string | null } | null;
}

export function ReviewForm({ courseId, existingReview }: Props) {
  const [pending, startTransition] = useTransition();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (rating === 0) {
      toast.error("اختر تقييماً من 1 إلى 5 نجوم");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId, rating, comment }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || "فشل الإرسال");
        setSubmitted(true);
        toast.success(data.message);
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  if (submitted) {
    return (
      <Card className="rounded-2xl border-emerald-200 bg-emerald-50/40">
        <CardContent className="p-6 text-center">
          <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-600 mb-2" />
          <p className="font-semibold">شكراً لتقييمك!</p>
          <p className="text-sm text-muted-foreground mt-1">رأيك يساعد الطلاب الآخرين</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-border/60">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="h-5 w-5 text-[#D65221]" />
          {existingReview ? "تعديل تقييمك" : "قيّم الدورة"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>تقييمك</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hover || rating)
                      ? "fill-[#D65221] text-[#D65221]"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="comment">تعليقك (اختياري)</Label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="rounded-xl min-h-[100px]"
            placeholder="كيف كانت تجربتك مع الدورة؟ ما الذي تعلمته؟"
          />
        </div>
        <Button
          onClick={submit}
          disabled={pending}
          className="rounded-xl brand-gradient text-white hover:opacity-90"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4 ml-1" />}
          {existingReview ? "تحديث التقييم" : "إرسال التقييم"}
        </Button>
      </CardContent>
    </Card>
  );
}
