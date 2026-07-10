"use client";

import { useState, useTransition } from "react";
import { Eye, X, Loader2, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ImpersonationBannerProps {
  /** Name of the user being impersonated */
  targetName: string;
  /** Target user ID (for ending impersonation) */
  targetId: string;
}

/**
 * Banner shown at the top of any page when an admin is impersonating a user.
 * Calls DELETE /api/admin/users/:id/impersonate then signs out + redirects to /login
 * so the admin can re-authenticate.
 */
export function ImpersonationBanner({ targetName, targetId }: ImpersonationBannerProps) {
  const [pending, startTransition] = useTransition();
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  if (dismissed) return null;

  const endImpersonation = () => {
    startTransition(async () => {
      try {
        await fetch(`/api/admin/users/${targetId}/impersonate`, { method: "DELETE" });
        toast.success("تم إنهاء الانتحال — سجّل الدخول من جديد كمدير");
        // Sign out the impersonated session
        await signOut({ redirect: false });
        router.push("/login");
      } catch (err: any) {
        toast.error(err.message || "فشل إنهاء الانتحال");
      }
    });
  };

  return (
    <div className="sticky top-0 z-[60] bg-gradient-to-l from-[#D65221] via-[#00A3AA] to-[#0A9ED9] text-white shadow-md">
      <div className="container mx-auto px-4 lg:px-8 h-12 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium min-w-0">
          <Eye className="h-4 w-4 shrink-0" />
          <span className="truncate">
            أنت في وضع الانتحال نيابةً عن <strong>{targetName}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={endImpersonation}
            disabled={pending}
            className="h-8 rounded-lg bg-white text-foreground hover:bg-white/90 px-3"
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <LogOut className="h-3.5 w-3.5 ml-1" />
            )}
            إنهاء الانتحال
          </Button>
          <button
            onClick={() => setDismissed(true)}
            className="h-8 w-8 rounded-lg hover:bg-white/20 flex items-center justify-center"
            aria-label="إخفاء"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
