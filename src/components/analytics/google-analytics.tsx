// ====================================================================
// Google Analytics 4 integration
// Set NEXT_PUBLIC_GA_MEASUREMENT_ID env var (e.g., G-XXXXXXXXXX)
// ====================================================================

import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

/**
 * Track a custom event (client-side)
 * Usage: trackEvent('sign_up', { method: 'email' });
 */
export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window === "undefined") return;
  if (!GA_ID) return;
  (window as any).gtag?.("event", eventName, params);
}

/**
 * Track page view (for SPA navigation)
 */
export function trackPageView(path: string) {
  if (typeof window === "undefined") return;
  if (!GA_ID) return;
  (window as any).gtag?.("config", GA_ID, { page_path: path });
}
