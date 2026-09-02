"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Loader2, Plus } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ar } from "@/lib/i18n";

interface Track {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  skills: string[];
  order: number;
  isActive: boolean;
  _count?: { students: number; milestones: number };
}

export default function AdminTracksPage() {
  const { toast } = useToast();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "", color: "", skills: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetch("/api/tracks").then((r) => r.json());
      setTracks(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createTrack(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "فشل");
      toast({ variant: "success", title: ar.admin.trackSaved });
      setDialogOpen(false);
      setForm({ name: "", slug: "", description: "", color: "", skills: "" });
      load();
    } catch (err) {
      toast({ variant: "destructive", title: "خطأ", description: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div>
        <AdminNav />
        <Skeleton className="h-10 w-56" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <AdminNav />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">{ar.admin.tracksTitle}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{ar.admin.tracksSubtitle}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> {ar.admin.addTrack}</Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tracks.map((t) => (
          <div key={t.id} className="rounded-2xl border border-border/60 bg-card/60 p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl text-primary" style={{ backgroundColor: `${t.color ?? "#6366f1"}1f`, color: t.color ?? "#6366f1" }}>
                <GraduationCap className="h-5 w-5" />
              </div>
              <Badge variant={t.isActive ? "success" : "muted"}>{t.isActive ? "نشط" : "مخفي"}</Badge>
            </div>
            <h3 className="mt-3 font-display font-bold">{t.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{t.description || "لا يوجد وصف."}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {t.skills.slice(0, 5).map((s) => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
              {t.skills.length > 5 && <Badge variant="outline" className="text-xs">+{t.skills.length - 5}</Badge>}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>إنشاء مسار مهني</DialogTitle></DialogHeader>
          <form onSubmit={createTrack} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>{ar.admin.trackName}</Label><Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
              <div className="space-y-2"><Label>الرابط</Label><Input required placeholder="frontend-engineering" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>{ar.admin.trackDescription}</Label><Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>{ar.admin.trackColor}</Label><Input placeholder="#6366f1" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} /></div>
              <div className="space-y-2"><Label>المهارات (مفصولة بفاصلة)</Label><Input value={form.skills} onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))} /></div>
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {ar.admin.saveTrack}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
