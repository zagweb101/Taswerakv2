import type { Metadata } from "next";
import { Cairo, Tajawal } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";
import { CookieConsentBanner } from "@/components/legal/cookie-consent-banner";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  weight: ["300", "400", "500", "700", "800"],
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "تصويرك | Taswerak",
  description:
    "منصة تصويرك لتعلّم التصوير الفوتوغرافي من الصفر للاحتراف — جدة، السعودية. دورات في أساسيات التصوير، تصوير البيوتي، وميكب توتوريال.",
  keywords: [
    "تصويرك",
    "Taswerak",
    "تصوير فوتوغرافي",
    "دورات تصوير",
    "جدة",
    "تصوير البيوتي",
    "ميكب توتوريال",
    "أحمد زغلول",
  ],
  authors: [{ name: "Ahmed Zaghloul" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "تصويرك | Taswerak",
    description: "تعلّم التصوير الفوتوغرافي من الصفر للاحتراف",
    siteName: "تصويرك",
    type: "website",
    locale: "ar_SA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cairo.variable} ${tajawal.variable} antialiased bg-background text-foreground font-tajawal`}
        style={{ fontFamily: "var(--font-tajawal), system-ui, sans-serif" }}
      >
        <SessionProvider>{children}</SessionProvider>
        <CookieConsentBanner />
        <Toaster />
        <SonnerToaster position="top-center" dir="rtl" />
      </body>
    </html>
  );
}
