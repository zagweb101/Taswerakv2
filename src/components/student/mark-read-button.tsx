"use client";

import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function MarkReadButton({ notificationId }: { notificationId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      onClick={() => {
        startTransition(async () => {
          try {
            const res = await fetch(`/api/student/notifications/${notificationId}`, {
              method: "PATCH",
            });
            const data = await res.json();
            if (res.ok && data.ok) {
              toast.success("تم تعليم الإشعار كمقروء");
              router.refresh();
            } else {
              throw new Error(data.error || "فشل");
            }
          } catch {
            toast.error("تعذّر تحديث الإشعار");
          }
        });
      }}
      disabled={pending}
      className="text-xs text-muted-foreground hover:text-foreground shrink-0 disabled:opacity-50"
      aria-label="تعليم كمقروء"
      title="تعليم كمقروء"
    >
      <CheckCircle2 className="h-4 w-4" />
    </button>
  );
}
