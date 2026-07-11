import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { statusLabels, statusBadgeClasses } from "@/lib/helpers";

export function EnrollmentStatusBadge({ status }: { status: string }) {
  const label = (statusLabels.enrollment as any)[status] || status;
  const cls = (statusBadgeClasses.enrollment as any)[status] || "bg-muted text-muted-foreground";
  return <Badge className={cn(cls, "hover:opacity-90")}>{label}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const label = (statusLabels.payment as any)[status] || status;
  const cls = (statusBadgeClasses.payment as any)[status] || "bg-muted text-muted-foreground";
  return <Badge className={cn(cls, "hover:opacity-90")}>{label}</Badge>;
}

export function SubmissionStatusBadge({ status }: { status: string }) {
  const label = (statusLabels.submission as any)[status] || status;
  const cls = (statusBadgeClasses.submission as any)[status] || "bg-muted text-muted-foreground";
  return <Badge className={cn(cls, "hover:opacity-90")}>{label}</Badge>;
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
