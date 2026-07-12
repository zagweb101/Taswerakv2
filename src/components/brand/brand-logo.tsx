import Image from "next/image";

interface BrandLogoProps {
  variant?: "compact" | "large" | "sidebar";
  className?: boolean | string;
  showSubtitle?: boolean;
}

export function BrandLogo({ variant = "compact", className, showSubtitle = false }: BrandLogoProps) {
  const sizes = {
    compact: { img: 40, text: "text-xl", gap: "gap-2.5" },
    sidebar: { img: 36, text: "text-lg", gap: "gap-2" },
    large: { img: 56, text: "text-2xl", gap: "gap-3" },
  };

  const s = sizes[variant];

  return (
    <div className={`flex items-center ${s.gap} ${typeof className === "string" ? className : ""}`}>
      <Image
        src="/logo.webp"
        alt="منصة تصويرك"
        width={s.img}
        height={s.img}
        className="rounded-lg object-contain shrink-0"
        priority
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
