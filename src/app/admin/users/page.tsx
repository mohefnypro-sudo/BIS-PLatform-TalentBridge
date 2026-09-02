"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Search, XCircle } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ar } from "@/lib/i18n";
import { cn, initials, timeAgo } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
  status: string;
  createdAt: string;
  studentProfile?: { tier: string; level: string; showcase: boolean } | null;
  mentorProfile?: { isVerified: boolean; domains: string[] } | null;
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (q) params.set("q", q);
    try {
      const data = await fetch(`/api/admin/users?${params.toString()}`).then((r) => r.json());
      setUsers(data.users ?? []);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, q]);

  useEffect(() => {
    load();
  }, [load]);

  async function verify(userId: string, status: string) {
    setActing(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "فشل");
      const statusTitles: Record<string, string> = {
        ACTIVE: ar.admin.userVerified,
        SUSPENDED: ar.admin.userSuspended,
        REJECTED: ar.admin.userRejected,
      };
      const statusDesc: Record<string, string> = {
        ACTIVE: "نشط",
        SUSPENDED: "معلق",
        REJECTED: "مرفوض",
      };
      toast({ variant: "success", title: statusTitles[status] ?? "تم التحديث", description: `تم تعيين الحالة إلى ${statusDesc[status] ?? status}.` });
      load();
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: (e as Error).message });
    } finally {
      setActing(null);
    }
  }

  const statusStyles: Record<string, string> = {
    PENDING: "bg-amber-500/15 text-amber-600",
    ACTIVE: "bg-emerald-500/15 text-emerald-600",
    SUSPENDED: "bg-red-500/15 text-red-600",
    REJECTED: "bg-red-500/15 text-red-600",
  };

  const statusLabels: Record<string, string> = {
    PENDING: "قيد الانتظار",
    ACTIVE: "نشط",
    SUSPENDED: "معلق",
    REJECTED: "مرفوض",
  };

  const roleLabels: Record<string, string> = {
    STUDENT: "طالب",
    MENTOR: "مشرف",
    RECRUITER: "مستخدم",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <AdminNav />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">{ar.admin.usersTitle}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{ar.admin.usersSubtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select className="h-10 rounded-lg border border-input bg-background px-3 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">جميع الحالات</option>
            <option value="PENDING">قيد الانتظار</option>
            <option value="ACTIVE">نشط</option>
            <option value="SUSPENDED">معلق</option>
            <option value="REJECTED">مرفوض</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="بحث في المستخدمين..." value={q} onChange={(e) => setQ(e.target.value)} className="w-56 pl-9" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {users.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">لم يتم العثور على مستخدمين.</p>}
          {users.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/60 bg-card/60 p-4">
              <Avatar className="h-12 w-12">
                {u.image ? <AvatarImage src={u.image} alt={u.name} /> : null}
                <AvatarFallback>{initials(u.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{u.name}</span>
                  <Badge variant="secondary" className="text-xs">{roleLabels[u.role.toUpperCase()] ?? u.role.toLowerCase()}</Badge>
                  <Badge className={cn("", statusStyles[u.status] ?? "")}>{statusLabels[u.status] ?? u.status.toLowerCase()}</Badge>
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {u.email} · انضم {timeAgo(u.createdAt)}
                  {u.studentProfile && ` · ${u.studentProfile.tier} مرحلة · ${u.studentProfile.level}`}
                  {u.mentorProfile && ` · ${u.mentorProfile.domains.join(", ")}`}
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {u.status !== "ACTIVE" && (
                  <Button size="sm" disabled={acting === u.id} onClick={() => verify(u.id, "ACTIVE")}>
                    {acting === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {ar.admin.verify}
                  </Button>
                )}
                {u.status !== "SUSPENDED" && u.status !== "REJECTED" && (
                  <Button size="sm" variant="outline" disabled={acting === u.id} onClick={() => verify(u.id, "SUSPENDED")}>
                    {ar.admin.suspend}
                  </Button>
                )}
                {u.status === "PENDING" && (
                  <Button size="sm" variant="destructive" disabled={acting === u.id} onClick={() => verify(u.id, "REJECTED")}>
                    <XCircle className="h-4 w-4" /> {ar.admin.reject}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
