"use client";

import { useState } from "react";
import { Bell, CheckCircle2 } from "lucide-react";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  role: string;
  sidebarMode?: boolean;
}

export function NotificationBell({ role, sidebarMode }: Props) {
  const { unreadCount, notifications, hasNew, markAllRead } = useRealtimeNotifications(true);
  const [open, setOpen] = useState(false);

  const notifPage = `/${role}/notifications`;

  if (sidebarMode) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors relative"
          >
            <span className="flex items-center">
              <Bell className="h-4 w-4 ml-2" />
              الإشعارات
            </span>
            {unreadCount > 0 && (
              <span className="bg-[#D65221] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <NotificationList
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAllRead={markAllRead}
            notifPage={notifPage}
            onClose={() => setOpen(false)}
          />
        </PopoverContent>
      </Popover>
    );
  }

  // Mobile mode (compact)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="p-2 rounded-lg hover:bg-muted/60 relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 left-1 bg-[#D65221] text-white text-[9px] font-bold px-1 py-0.5 rounded-full min-w-[16px] text-center animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <NotificationList
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAllRead={markAllRead}
          notifPage={notifPage}
          onClose={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}

function NotificationList({
  notifications, unreadCount, onMarkAllRead, notifPage, onClose,
}: {
  notifications: any[];
  unreadCount: number;
  onMarkAllRead: () => void;
  notifPage: string;
  onClose: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between p-3 border-b border-border/40">
        <span className="text-sm font-semibold">
          الإشعارات {unreadCount > 0 && `(${unreadCount})`}
        </span>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-xs text-[#0A9ED9] hover:underline flex items-center gap-1"
          >
            <CheckCircle2 className="h-3 w-3" />
            تعليم الكل كمقروء
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="p-6 text-center text-sm text-muted-foreground">
          <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
          لا توجد إشعارات جديدة
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto nice-scroll divide-y divide-border/30">
          {notifications.slice(0, 8).map((n) => (
            <a
              key={n.id}
              href={n.link || notifPage}
              onClick={onClose}
              className="block p-3 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-start gap-2">
                <div className={cn(
                  "h-2 w-2 rounded-full mt-1.5 shrink-0",
                  !n.readAt ? "bg-[#D65221] animate-pulse" : "bg-muted-foreground/30"
                )} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{n.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.body}</div>
                  <div className="text-[10px] text-muted-foreground/60 mt-1">
                    {timeAgo(new Date(n.createdAt))}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      <div className="p-2 border-t border-border/40">
        <a
          href={notifPage}
          onClick={onClose}
          className="block text-center text-xs text-muted-foreground hover:text-foreground py-1"
        >
          عرض كل الإشعارات
        </a>
      </div>
    </div>
  );
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (day > 0) return `منذ ${day} يوم`;
  if (hr > 0) return `منذ ${hr} ساعة`;
  if (min > 0) return `منذ ${min} دقيقة`;
  return "الآن";
}
