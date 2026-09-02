"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  CalendarCheck,
  FolderGit2,
  Users,
} from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ar } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Stats {
  totalUsers: number;
  pendingVerifications: number;
  totalProjects: number;
  approvedProjects: number;
  totalJobs: number;
  openJobs: number;
  totalBookings: number;
  totalApplications: number;
  topTracks: Array<{ track: string; color?: string | null; count: number }>;
  byRole: Array<{ role: string; _count: { _all: number } }>;
  byStatus: Array<{ status: string; _count: { _all: number } }>;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div>
        <AdminNav />
        <Skeleton className="h-10 w-64" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      </div>
    );
  }

  const cards = [
    { label: "إجمالي المستخدمين", value: stats.totalUsers, icon: Users, sub: `${stats.pendingVerifications} في انتظار التحقق` },
    { label: ar.admin.totalProjects, value: stats.totalProjects, icon: FolderGit2, sub: `${stats.approvedProjects} معتمدة ومنشورة` },
    { label: "الوظائف المنشورة", value: stats.totalJobs, icon: Briefcase, sub: `${stats.openJobs} مفتوحة حالياً` },
    { label: "الجلسات المحجوزة", value: stats.totalBookings, icon: CalendarCheck, sub: `${stats.totalApplications} تقديم وظائف` },
  ];

  const maxTrack = Math.max(1, ...stats.topTracks.map((t) => t.count));

  const statusLabels: Record<string, string> = {
    ACTIVE: "نشط",
    PENDING: "قيد الانتظار",
    SUSPENDED: "معلق",
    REJECTED: "مرفوض",
  };

  const roleLabels: Record<string, string> = {
    student: "طالب",
    mentor: "مشرف",
    recruiter: "مستخدم",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <AdminNav />
      <h1 className="font-display text-2xl font-bold">{ar.admin.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">قياسات مباشرة عبر منصة TalentBridge.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-0">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{c.label}</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600/15 to-fuchsia-600/15 text-primary">
                  <c.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 font-display text-3xl font-bold">{c.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{c.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-display font-bold">أبرز المسارات المهنية</h3>
            <div className="mt-4 space-y-3">
              {stats.topTracks.length === 0 && <p className="text-sm text-muted-foreground">لم يتم تعيين أي طلاب بعد.</p>}
              {stats.topTracks.map((t) => (
                <div key={t.track}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{t.track}</span>
                    <span className="font-medium">{t.count}</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-700"
                      style={{ width: `${(t.count / maxTrack) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-display font-bold">المستخدمون حسب الدور</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.byRole.map((r) => (
                <div key={r.role} className="rounded-2xl border border-border/60 p-4 text-center">
                  <div className="font-display text-2xl font-bold">{r._count._all}</div>
                  <div className="text-xs text-muted-foreground">{roleLabels[r.role.toLowerCase()] ?? r.role.toLowerCase()}</div>
                </div>
              ))}
            </div>
            <h3 className="mt-6 font-display font-bold">المستخدمون حسب الحالة</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {stats.byStatus.map((s) => (
                <Badge
                  key={s.status}
                  className={cn(
                    "px-3 py-1.5",
                    s.status === "ACTIVE" && "bg-emerald-500/15 text-emerald-600",
                    s.status === "PENDING" && "bg-amber-500/15 text-amber-600",
                    s.status === "SUSPENDED" && "bg-red-500/15 text-red-600",
                    s.status === "REJECTED" && "bg-red-500/15 text-red-600",
                  )}
                >
                  {statusLabels[s.status] ?? s.status.toLowerCase()} · {s._count._all}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
