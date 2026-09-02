"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Loader2, Plus, Target, Trash2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
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
  color?: string | null;
  skills: string[];
}

interface Milestone {
  id: string;
  title: string;
  description?: string | null;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED";
  progress: number;
  track: { name: string; color?: string | null };
}

export function GrowthTab({ refreshKey }: { refreshKey: number }) {
  const { toast } = useToast();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [profile, setProfile] = useState<{ careerTrackId?: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ trackId: "", title: "", description: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tracksRes, meRes] = await Promise.all([
        fetch("/api/tracks").then((r) => r.json()),
        fetch("/api/students/me").then((r) => r.json()),
      ]);
      setTracks(tracksRes);
      setMilestones(meRes.milestones ?? []);
      setProfile(meRes);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  async function createMilestone(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      toast({ variant: "success", title: ar.growth.milestoneAdded, description: ar.growth.subtitle });
      setDialogOpen(false);
      setForm({ trackId: tracks[0]?.id ?? "", title: "", description: "" });
      load();
    } catch (e) {
      toast({ variant: "destructive", title: ar.common.error, description: (e as Error).message });
    } finally {
      setSaving(false);
    }
  }

  async function setMilestoneStatus(m: Milestone, status: Milestone["status"]) {
    const progress = status === "COMPLETED" ? 100 : status === "IN_PROGRESS" ? Math.max(m.progress, 25) : 0;
    await fetch(`/api/milestones/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, progress }),
    });
    load();
  }

  async function deleteMilestone(id: string) {
    await fetch(`/api/milestones/${id}`, { method: "DELETE" });
    toast({ title: ar.growth.milestoneRemoved });
    load();
  }

  const completed = milestones.filter((m) => m.status === "COMPLETED").length;
  const inProgress = milestones.filter((m) => m.status === "IN_PROGRESS").length;
  const pct = milestones.length ? Math.round((completed / milestones.length) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-36 w-full" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 p-6">
        <div className="bg-grid absolute inset-0 opacity-20" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-500" />
              <h2 className="font-display text-xl font-bold">{ar.growth.title}</h2>
              <Badge variant="success">{ar.growth.badge}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {ar.growth.subtitle}
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> {ar.growth.addMilestone}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{ar.growth.milestones}</span>
            <Trophy className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-1 font-display text-3xl font-bold">{milestones.length}</div>
        </div>
        <div className="rounded-2xl border border-border/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{ar.growth.completed}</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-1 font-display text-3xl font-bold text-emerald-500">{completed}</div>
        </div>
        <div className="rounded-2xl border border-border/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{ar.growth.inProgress}</span>
            <Circle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-1 font-display text-3xl font-bold text-amber-500">{inProgress}</div>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{ar.growth.roadmapProgress}</CardTitle>
          <span className="font-display text-lg font-bold text-gradient">{pct}%</span>
        </CardHeader>
        <CardContent>
          <Progress value={pct} />
        </CardContent>
      </Card>

      <div className="space-y-3">
        {milestones.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border/70 p-10 text-center">
            <Target className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">{ar.growth.noMilestones}</p>
          </div>
        )}
        <AnimatePresence>
          {milestones.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="p-0">
                <CardContent className="flex items-center gap-4 p-4">
                  <button
                    onClick={() => setMilestoneStatus(m, m.status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED")}
                    className="shrink-0 text-muted-foreground transition-colors hover:text-emerald-500"
                    aria-label="Toggle milestone status"
                  >
                    {m.status === "COMPLETED" ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    ) : m.status === "IN_PROGRESS" ? (
                      <Circle className="h-6 w-6 text-amber-500" />
                    ) : (
                      <Circle className="h-6 w-6" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{m.title}</span>
                      <Badge variant={m.status === "COMPLETED" ? "success" : m.status === "IN_PROGRESS" ? "warning" : "muted"}>
                        {m.status === "COMPLETED" ? ar.growth.completed : m.status === "IN_PROGRESS" ? ar.growth.inProgress : "مخطط"}
                      </Badge>
                    </div>
                    {m.description && <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{m.description}</p>}
                    <Progress className="mt-2 h-1.5" value={m.progress} />
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="secondary" className="bg-muted">{m.track.name}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => deleteMilestone(m.id)} aria-label="Delete milestone">
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ar.growth.addLearningMilestone}</DialogTitle>
          </DialogHeader>
          <form onSubmit={createMilestone} className="space-y-4">
            <div className="space-y-2">
              <Label>{ar.growth.careerTrack}</Label>
              <Select value={form.trackId} onValueChange={(v) => setForm((f) => ({ ...f, trackId: v }))}>
                <SelectTrigger><SelectValue placeholder={ar.growth.selectTrack} /></SelectTrigger>
                <SelectContent>
                  {tracks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{ar.growth.title}</Label>
              <Input required placeholder={ar.growth.titlePlaceholder} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{ar.growth.notes}</Label>
              <Textarea placeholder={ar.growth.notesPlaceholder} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <Button type="submit" className="w-full" disabled={saving || !form.trackId}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {ar.growth.save}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
