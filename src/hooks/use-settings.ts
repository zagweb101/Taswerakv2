"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface UseSettingsOptions {
  /** API endpoint (e.g., "/api/student/settings") */
  endpoint: string;
  /** Whether to auto-fetch on mount */
  autoFetch?: boolean;
}

interface UseSettingsResult<T> {
  settings: T | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  saveSection: (section: string, data: any) => Promise<boolean>;
}

/**
 * Shared hook for Settings pages — fetch + save sections.
 * Each save only sends one section to the API for atomic updates.
 */
export function useSettings<T = any>({
  endpoint,
  autoFetch = true,
}: UseSettingsOptions): UseSettingsResult<T> {
  const [settings, setSettings] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "فشل تحميل الإعدادات");
      }
      setSettings(data.settings);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const saveSection = useCallback(
    async (section: string, data: any): Promise<boolean> => {
      setSaving(true);
      try {
        const res = await fetch(endpoint, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section, [section]: data }),
        });
        const result = await res.json();
        if (!res.ok || !result.ok) {
          throw new Error(result.error || "فشل حفظ الإعدادات");
        }
        // Merge returned settings
        if (result.settings) {
          setSettings((prev) => ({ ...(prev as any), ...result.settings }));
        }
        toast.success(result.message || "تم الحفظ بنجاح");
        return true;
      } catch (err: any) {
        toast.error(err.message);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [endpoint]
  );

  useEffect(() => {
    if (autoFetch) refetch();
  }, [autoFetch, refetch]);

  return { settings, loading, saving, error, refetch, saveSection };
}
