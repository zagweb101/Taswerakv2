import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const enrollmentStatusMap: Record<string, { label: string; cls: string }> = {
  PENDING_PAYMENT: { label: "بانتظار الدفع", cls: "bg-amber-100 text-amber-700" },
  PENDING_APPROVAL: { label: "قيد المراجعة", cls: "bg-blue-100 text-blue-700" },
  ACTIVE: { label: "نشط", cls: "bg-emerald-100 text-emerald-700" },
  COMPLETED: { label: "مكتمل", cls: "bg-teal-100 text-teal-700" },
  EXPIRED: { label: "منتهي", cls: "bg-red-100 text-red-700" },
  CANCELLED: { label: "ملغى", cls: "bg-zinc-100 text-zinc-700" },
  REFUNDED: { label: "مُسترد", cls: "bg-purple-100 text-purple-700" },
};

const paymentStatusMap: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "قيد المراجعة", cls: "bg-amber-100 text-amber-700" },
  APPROVED: { label: "معتمد", cls: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "مرفوض", cls: "bg-red-100 text-red-700" },
  NEEDS_REVIEW: { label: "يحتاج مراجعة", cls: "bg-blue-100 text-blue-700" },
};

const submissionStatusMap: Record<string, { label: string; cls: string }> = {
  SUBMITTED: { label: "مُسلَّم", cls: "bg-blue-100 text-blue-700" },
  UNDER_REVIEW: { label: "قيد النقد", cls: "bg-amber-100 text-amber-700" },
  CRITIQUED: { label: "تم النقد", cls: "bg-teal-100 text-teal-700" },
  RESUBMITTED: { label: "إعادة تسليم", cls: "bg-purple-100 text-purple-700" },
  APPROVED: { label: "معتمد", cls: "bg-emerald-100 text-emerald-700" },
};

export function EnrollmentStatusBadge({ status }: { status: string }) {
  const m = enrollmentStatusMap[status] || { label: status, cls: "bg-muted text-muted-foreground" };
  return <Badge className={cn(m.cls, "hover:opacity-90")}>{m.label}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const m = paymentStatusMap[status] || { label: status, cls: "bg-muted text-muted-foreground" };
  return <Badge className={cn(m.cls, "hover:opacity-90")}>{m.label}</Badge>;
}

export function SubmissionStatusBadge({ status }: { status: string }) {
  const m = submissionStatusMap[status] || { label: status, cls: "bg-muted text-muted-foreground" };
  return <Badge className={cn(m.cls, "hover:opacity-90")}>{m.label}</Badge>;
}

export function ProgressRing({ value }: { value: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative h-14 w-14">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 50 50">
        <circle cx="25" cy="25" r={radius} fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30" />
        <circle
          cx="25"
          cy="25"
          r={radius}
          fill="none"
          stroke="url(#progressGrad)"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
        <defs>
          <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0A9ED9" />
            <stop offset="50%" stopColor="#00A3AA" />
            <stop offset="100%" stopColor="#D65221" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
        {Math.round(value)}%
      </div>
    </div>
  );
}
