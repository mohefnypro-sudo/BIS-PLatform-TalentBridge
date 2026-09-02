"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, FolderGit2, Loader2, Search, Star, XCircle } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ar } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface AdminProject {
  id: string;
  title: string;
  slug: string;
  domain: string;
  status: string;
  isFeatured: boolean;
  createdAt: string;
  owner?: { user: { name: string; image?: string | null } } | null;
  members: Array<{ student: { user: { name: string } } }>;
}

const STATUS_STYLES: Record<string, string> = {
  SUBMITTED: "bg-amber-500/15 text-amber-600",
  APPROVED: "bg-emerald-500/15 text-emerald-600",
  REJECTED: "bg-red-500/15 text-red-600",
  DRAFT: "bg-slate-500/15 text-slate-600",
  ARCHIVED: "bg-slate-500/15 text-slate-600",
};

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "مقدمة",
  APPROVED: "معتمدة",
  REJECTED: "مرفوضة",
  DRAFT: "مسودة",
  ARCHIVED: "مؤرشفة",
};

export default function AdminProjectsPage() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<AdminProject[]>([]);
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
      const data = await fetch(`/api/admin/projects?${params.toString()}`).then((r) => r.json());
      setProjects(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, q]);

  useEffect(() => {
    load();
  }, [load]);

  async function update(id: string, body: { status?: string; isFeatured?: boolean }) {
    setActing(id);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "فشل");
      toast({ variant: "success", title: "تم تحديث المشروع" });
      load();
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: (e as Error).message });
    } finally {
      setActing(null);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <AdminNav />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">{ar.admin.projectsTitle}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{ar.admin.projectsSubtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select className="h-10 rounded-lg border border-input bg-background px-3 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">جميع الحالات</option>
            <option value="SUBMITTED">مقدمة</option>
            <option value="APPROVED">معتمدة</option>
            <option value="REJECTED">مرفوضة</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="بحث في المشاريع..." value={q} onChange={(e) => setQ(e.target.value)} className="w-56 pl-9" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {projects.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">لم يتم العثور على مشاريع.</p>}
          {projects.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/60 bg-card/60 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600/15 to-fuchsia-600/15 text-primary">
                <FolderGit2 className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/projects/${p.slug}`} className="font-medium hover:text-primary">{p.title}</Link>
                  <Badge className={cn("", STATUS_STYLES[p.status] ?? "")}>{STATUS_LABELS[p.status] ?? p.status.toLowerCase()}</Badge>
                  {p.isFeatured && <Badge className="bg-amber-400 text-amber-950">{ar.admin.featured}</Badge>}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {p.domain} · بواسطة {p.owner?.user.name ?? "—"} · {p.members.length} {p.members.length === 1 ? "عضو" : "أعضاء"}
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {p.status !== "APPROVED" && (
                  <Button size="sm" disabled={acting === p.id} onClick={() => update(p.id, { status: "APPROVED" })}>
                    {acting === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {ar.admin.approve}
                  </Button>
                )}
                {p.status !== "REJECTED" && (
                  <Button size="sm" variant="destructive" disabled={acting === p.id} onClick={() => update(p.id, { status: "REJECTED" })}>
                    <XCircle className="h-4 w-4" /> {ar.admin.reject}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={acting === p.id}
                  onClick={() => update(p.id, { isFeatured: !p.isFeatured })}
                  className={cn(p.isFeatured && "border-amber-400/50 text-amber-500")}
                >
                  <Star className={cn("h-4 w-4", p.isFeatured && "fill-current")} />
                  {p.isFeatured ? "إلغاء التمييز" : ar.admin.feature}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
