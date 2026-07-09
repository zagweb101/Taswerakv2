import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  hint?: string;
  cta?: { href: string; label: string };
}

export function DashboardEmptyState({ icon, title, hint, cta }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      {icon && (
        <div className="mx-auto h-14 w-14 rounded-2xl brand-gradient-soft flex items-center justify-center text-muted-foreground mb-4">
          {icon}
        </div>
      )}
      <p className="font-semibold text-base">{title}</p>
      {hint && <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">{hint}</p>}
      {cta && (
        <Link href={cta.href} className="inline-block mt-4">
          <Button className="rounded-xl brand-gradient text-white hover:opacity-90">
            {cta.label}
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          </Button>
        </Link>
      )}
    </div>
  );
}
