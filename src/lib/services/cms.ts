// ====================================================================
// CMS content fetcher — reads from CmsContent table with fallback
// Used by landing page + footer to display admin-editable content
// ====================================================================

import { db } from "@/lib/db";

const DEFAULTS: Record<string, string> = {
  hero_title: "تعلّم التصوير الفوتوغرافي من الصفر للاحتراف",
  hero_subtitle: "دورات مباشرة مع أحمد زغلول في جدة — أساسيات، بيوتي، وميكب توتوريال.",
  footer_note: "© 2026 تصويرك — جميع الحقوق محفوظة",
  contact_email: "info@taswerak.com",
  contact_phone: "+966 5X XXX XXXX",
  bank_name: "البنك الأهلي السعودي",
  bank_account_name: "أحمد زغلول - تصويرك",
  bank_iban: "SA00 0000 0000 0000 0000 0000",
  city: "جدة",
};

/**
 * Get a CMS value by key. Falls back to DEFAULTS if DB unavailable.
 * Note: keys are stored in CmsContent with `admin_settings_` prefix for admin-managed
 * settings (bank, smtp, etc.) or without prefix for content (hero_title, footer_note).
 */
export async function getCmsValue(key: string): Promise<string> {
  // Try without prefix first (content keys)
  try {
    const row = await db.cmsContent.findUnique({ where: { key } });
    if (row?.value) return row.value;
  } catch {
    // DB unavailable
  }
  // Try admin_settings_ prefix (admin-managed settings)
  try {
    const row = await db.cmsContent.findUnique({ where: { key: `admin_settings_${key}` } });
    if (row?.value) {
      // Admin settings are stored as JSON; extract string value if it's a simple field
      try {
        const parsed = JSON.parse(row.value);
        if (typeof parsed === "string") return parsed;
        if (parsed[key]) return String(parsed[key]);
      } catch {
        return row.value;
      }
    }
  } catch {
    // DB unavailable
  }
  return DEFAULTS[key] || "";
}

/**
 * Get multiple CMS values at once (single query instead of N queries).
 */
export async function getCmsValues(keys: string[]): Promise<Record<string, string>> {
  try {
    // Fetch all possible keys (with and without admin prefix) in one query
    const adminKeys = keys.map((key) => `admin_settings_${key}`);
    const allKeys = [...keys, ...adminKeys];

    const rows = await db.cmsContent.findMany({
      where: { key: { in: allKeys } },
    });
    const rowMap = new Map(rows.map((r) => [r.key, r.value]));

    const result: Record<string, string> = {};
    for (const key of keys) {
      // Try exact key first, then admin-prefixed key
      const directValue = rowMap.get(key);
      if (directValue) {
        result[key] = directValue;
        continue;
      }

      const adminValue = rowMap.get(`admin_settings_${key}`);
      if (adminValue) {
        try {
          const parsed = JSON.parse(adminValue);
          if (typeof parsed === "string") {
            result[key] = parsed;
          } else if (parsed[key]) {
            result[key] = String(parsed[key]);
          } else {
            result[key] = adminValue;
          }
        } catch {
          result[key] = adminValue;
        }
        continue;
      }

      result[key] = DEFAULTS[key] || "";
    }
    return result;
  } catch {
    // DB unavailable — return defaults
    return keys.reduce((acc, key) => ({ ...acc, [key]: DEFAULTS[key] || "" }), {} as Record<string, string>);
  }
}
