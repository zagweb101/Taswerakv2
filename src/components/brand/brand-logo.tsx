import { cn } from "@/lib/utils";

interface BrandLogoProps {
  /** Size variant: compact for headers, large for auth pages */
  variant?: "compact" | "large" | "sidebar";
  /** Additional className for the container */
  className?: boolean | string;
  /** Show subtitle text */
  showSubtitle?: boolean;
}

/**
 * Reusable brand logo component.
 * Renders the real Taswerak logo image + platform name text.
 *
 * Variants:
 * - compact: 40px logo + bold name (for navbar headers)
 * - sidebar: 36px logo + bold name (for dashboard sidebars)
 * - large: 56px logo + larger text (for auth pages: login, signup, forgot-password)
 */
export function BrandLogo({ variant = "compact", className, showSubtitle = false }: BrandLogoProps) {
  const sizes = {
    compact: { img: 40, text: "text-xl", gap: "gap-2.5" },
    sidebar: { img: 36, text: "text-lg", gap: "gap-2" },
    large: { img: 56, text: "text-2xl", gap: "gap-3" },
  };

  const s = sizes[variant];

  return (
    <div className={`flex items-center ${s.gap} ${typeof className === "string" ? className : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.webp"
        alt="منصة تصويرك"
        width={s.img}
        height={s.img}
        className="rounded-lg object-contain shrink-0"
        style={{ width: s.img, height: s.img }}
      />
      <div className="flex flex-col">
        <span className={`font-extrabold brand-gradient-text leading-tight ${s.text}`}>
          منصة تصويرك
        </span>
        {showSubtitle && (
          <span className="text-[10px] text-muted-foreground leading-tight">
            منصة تعليم التصوير
          </span>
        )}
      </div>
    </div>
  );
}
