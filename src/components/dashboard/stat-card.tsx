import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  hint?: string;
  tint?: "blue" | "teal" | "orange" | "purple" | "amber";
}

const tints: Record<NonNullable<StatCardProps["tint"]>, string> = {
  blue: "from-[#0A9ED9]/10 to-[#0A9ED9]/5",
  teal: "from-[#00A3AA]/10 to-[#00A3AA]/5",
  orange: "from-[#D65221]/10 to-[#D65221]/5",
  purple: "from-purple-100 to-purple-50",
  amber: "from-amber-100 to-amber-50",
};

const iconColors: Record<NonNullable<StatCardProps["tint"]>, string> = {
  blue: "text-[#0A9ED9]",
  teal: "text-[#00A3AA]",
  orange: "text-[#D65221]",
  purple: "text-purple-600",
  amber: "text-amber-600",
};

export function DashboardStatCard({
  icon,
  label,
  value,
  hint,
  tint = "blue",
}: StatCardProps) {
  return (
    <Card className={cn("rounded-2xl border-border/40 bg-gradient-to-bl", tints[tint])}>
      <CardContent className="p-4">
        <div className={cn("mb-2", iconColors[tint])}>{icon}</div>
        <div className="text-2xl lg:text-3xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
        {hint && <div className="text-[11px] text-muted-foreground/70 mt-0.5">{hint}</div>}
      </CardContent>
    </Card>
  );
}
