"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/actions/notifications";

type Notification = {
  id: string;
  report_id: string | null;
  type: string;
  service_name: string | null;
  is_read: boolean | null;
  created_at: string | null;
};

export function NotificationBell() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [, startTransition] = useTransition();

  async function refresh() {
    const { notifications } = await getNotifications();
    setNotifications(notifications as Notification[]);
    setLoaded(true);
  }

  useEffect(() => {
    refresh();
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  function renderText(n: Notification) {
    if (n.type === "service_assigned") {
      return t.notifications.serviceAssigned(n.service_name ?? "");
    }
    return n.service_name ?? n.type;
  }

  return (
    <DropdownMenu open={open} onOpenChange={(v) => { setOpen(v); if (v && loaded) refresh(); }}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t.notifications.bell}
          className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors"
        >
          <Bell className="w-4 h-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-sm font-semibold">{t.notifications.bell}</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => startTransition(async () => {
                await markAllNotificationsRead();
                refresh();
              })}
              className="text-xs text-primary hover:underline"
            >
              {t.notifications.markAllRead}
            </button>
          )}
        </div>
        {notifications.length === 0 ? (
          <p className="px-2 py-4 text-sm text-muted-foreground text-center">{t.notifications.empty}</p>
        ) : (
          notifications.map(n => (
            <DropdownMenuItem key={n.id} asChild className="cursor-pointer">
              <Link
                href={n.report_id ? `/dashboard/reports/${n.report_id}` : "/dashboard"}
                onClick={() => { if (!n.is_read) { markNotificationRead(n.id); } }}
                className={`flex flex-col items-start gap-0.5 whitespace-normal ${!n.is_read ? "bg-primary/5" : ""}`}
              >
                <span className="text-sm leading-snug">{renderText(n)}</span>
                {n.created_at && (
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                )}
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
