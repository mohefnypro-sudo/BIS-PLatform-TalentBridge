"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, timeAgo } from "@/lib/utils";
import { ar } from "@/lib/i18n";

interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  link?: string | null;
  readAt?: string | null;
  createdAt: string;
}

const TYPE_STYLES: Record<string, string> = {
  BOOKING: "bg-indigo-500/15 text-indigo-600",
  PROJECT: "bg-emerald-500/15 text-emerald-600",
  JOB: "bg-purple-500/15 text-purple-600",
  SYSTEM: "bg-slate-500/15 text-slate-600",
  MENTOR: "bg-amber-500/15 text-amber-600",
};

export function NotificationsTab({ refreshKey }: { refreshKey: number }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetch("/api/notifications").then((r) => r.json());
      setNotifications(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
  }

  async function markAllRead() {
    await fetch("/api/notifications/read-all", { method: "POST" });
    load();
  }

  const unread = notifications.filter((n) => !n.readAt).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold">{ar.notifications.title}</h2>
            {unread > 0 && <Badge variant="success">{unread} {ar.notifications.unread}</Badge>}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{ar.notifications.subtitle}</p>
        </div>
        {unread > 0 && (
          <Button size="sm" variant="outline" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" /> {ar.notifications.markAllRead}
          </Button>
        )}
      </div>

      {notifications.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center">
          <BellOff className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">{ar.notifications.allCaughtUp}</p>
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div
                onClick={() => markRead(n.id)}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-2xl border border-border/60 p-4 transition-colors hover:border-primary/40",
                  !n.readAt && "bg-gradient-to-r from-indigo-600/[0.07] to-fuchsia-600/[0.07]",
                )}
              >
                <div
                  className={cn(
                    "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                    n.readAt ? "bg-muted" : "bg-gradient-to-r from-indigo-500 to-fuchsia-500",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={cn("", TYPE_STYLES[n.type] ?? TYPE_STYLES.SYSTEM)}>{n.type.toLowerCase()}</Badge>
                    <span className="text-xs text-muted-foreground">{timeAgo(n.createdAt)}</span>
                  </div>
                  <p className="mt-1 font-medium">{n.title}</p>
                  {n.body && <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>}
                  {n.link && (
                    <Link
                      href={n.link}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 inline-block text-xs font-medium text-primary hover:underline"
                    >
                      {ar.notifications.view} →
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
