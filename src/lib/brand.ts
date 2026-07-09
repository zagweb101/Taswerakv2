// ====================================================================
// Taswerak — Brand tokens (logo gradient)
// Single source of truth for the gradient #0A9ED9 -> #00A3AA -> #D65221
// ====================================================================

export const brand = {
  name: "تصويرك",
  nameEn: "Taswerak",
  logoUrl: "/logo.svg",
  city: "جدة",
  country: "السعودية",
  gradient: {
    from: "#0A9ED9",
    mid: "#00A3AA",
    to: "#D65221",
  },
} as const;

export const brandGradient = `linear-gradient(135deg, ${brand.gradient.from} 0%, ${brand.gradient.mid} 50%, ${brand.gradient.to} 100%)`;

export const brandGradientCss = `bg-[linear-gradient(135deg,#0A9ED9_0%,#00A3AA_50%,#D65221_100%)]`;

export const brandTextGradient = `bg-[linear-gradient(135deg,#0A9ED9_0%,#00A3AA_50%,#D65221_100%)] bg-clip-text text-transparent`;
