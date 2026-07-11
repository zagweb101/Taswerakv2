"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { CheckCircle2, Wallet, Award, MessageSquare, Bell } from "lucide-react";

export interface RealtimeNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  link?: string | null;
  readAt: string | null;
  createdAt: string;
}

/**
 * Hook for real-time notifications.
 * Polls /api/notifications every 30 seconds and shows toast for new ones.
 *
 * Why polling instead of WebSocket?
 * - Coolify single-container deployment makes WebSocket mini-services complex
 * - Polling at 30s is sufficient for an LMS (not a chat app)
 * - Simpler to maintain + no extra port management
 *
 * When the platform scales to 1000+ users, upgrade to WebSocket.
 */
export function useRealtimeNotifications(enabled: boolean = true) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [hasNew, setHasNew] = useState(false);
  const lastFetchRef = useRef<Date>(new Date());
  const knownIdsRef = useRef<Set<string>>(new Set());

  const fetchNotifications = useCallback(async () => {
    if (!enabled) return;
    try {
      const res = await fetch("/api/notifications/unread");
      if (!res.ok) return;
      const data = await res.json();
      if (!data.ok) return;

      const newNotifs = data.notifications || [];
      setUnreadCount(newNotifs.length);
      setNotifications(newNotifs);

      // Check for genuinely new notifications (not seen before)
      const genuinelyNew = newNotifs.filter(
        (n: RealtimeNotification) => !knownIdsRef.current.has(n.id)
      );

      // First load: just populate known IDs without toasting
      if (knownIdsRef.current.size === 0) {
        newNotifs.forEach((n: RealtimeNotification) => knownIdsRef.current.add(n.id));
        return;
      }

      // Show toast for each new notification
      genuinelyNew.forEach((n: RealtimeNotification) => {
        knownIdsRef.current.add(n.id);
        showNotificationToast(n);
      });

      if (genuinelyNew.length > 0) {
        setHasNew(true);
      }

      lastFetchRef.current = new Date();
    } catch {
      // Silent fail — don't disrupt the app
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Use a flag to avoid setState after unmount
    let mounted = true;

    const doFetch = () => {
      if (mounted) fetchNotifications();
    };

    // Initial fetch (deferred to avoid synchronous state update in effect)
    const timer = setTimeout(doFetch, 100);

    // Poll every 30 seconds
    const interval = setInterval(doFetch, 30000);

    // Also refetch when tab regains focus
    const onFocus = () => doFetch();
    window.addEventListener("focus", onFocus);

    return () => {
      mounted = false;
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [enabled, fetchNotifications]);

  const markAllRead = useCallback(async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "PATCH" });
      setUnreadCount(0);
      setHasNew(false);
    } catch {
      // ignore
    }
  }, []);

  return { unreadCount, notifications, hasNew, markAllRead, refetch: fetchNotifications };
}

function showNotificationToast(n: RealtimeNotification) {
  const icon = getNotificationIcon(n.type);

  toast(n.title, {
    description: n.body,
    icon: icon,
    duration: 6000,
    action: n.link ? {
      label: "عرض",
      onClick: () => window.location.href = n.link!,
    } : undefined,
  });
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "PAYMENT_APPROVED":
      return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    case "PAYMENT_REJECTED":
      return <Wallet className="h-4 w-4 text-red-600" />;
    case "CERTIFICATE_ISSUED":
      return <Award className="h-4 w-4 text-[#D65221]" />;
    case "CRITIQUE_RECEIVED":
      return <MessageSquare className="h-4 w-4 text-[#00A3AA]" />;
    default:
      return <Bell className="h-4 w-4 text-[#0A9ED9]" />;
  }
}
