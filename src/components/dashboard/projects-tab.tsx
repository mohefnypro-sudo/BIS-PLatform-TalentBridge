"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FolderGit2, Github, Globe, Loader2, Plus, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { DOMAIN_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ar } from "@/lib/i18n";

interface ProjectMember {
  id: string;
  projectId: string;
  studentId: string;
  roleInProject?: string | null;
  isLead: boolean;
  project: {
    id: string;
    title: string;
    slug: string;
    abstract: string;
    domain: string;
    academicYear?: string | null;
    techStack: string[];
    coverImage?: string | null;
    status: string;
    isFeatured: boolean;
    rating: number;
  };
}

export function ProjectsTab({ refreshKey }: { refreshKey: number }) {
  const { toast } = useToast();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    abstract: "",
    about: "",
    domain: "Software Engineering",
    techStack: "",
    academicYear: String(new Date().getFullYear()),
    githubRepoUrl: "",
    liveDemoUrl: "",
    videoDemoUrl: "",
    advisorName: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const profile = await fetch("/api/students/me").then((r) => r.json());
      setMembers(profile.projects ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          techStack: form.techStack.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? ar.projectsTab.projectSubmittedDesc);
      toast({ variant: "success", title: ar.projectsTab.projectSubmitted, description: ar.projectsTab.projectSubmittedDesc });
      setDialogOpen(false);
      setForm({
        title: "",
        abstract: "",
        about: "",
        domain: "Software Engineering",
        techStack: "",
        academicYear: String(new Date().getFullYear()),
        githubRepoUrl: "",
        liveDemoUrl: "",
        videoDemoUrl: "",
        advisorName: "",
      });
      load();
    } catch (e) {
      toast({ variant: "destructive", title: ar.common.error, description: (e as Error).message });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      </div>
    );
  }

  const statusStyles: Record<string, string> = {
    SUBMITTED: "bg-amber-500/15 text-amber-600",
    APPROVED: "bg-emerald-500/15 text-emerald-600",
    REJECTED: "bg-red-500/15 text-red-600",
  };

  const statusLabels: Record<string, string> = {
    SUBMITTED: "مقدم",
    APPROVED: "موافق",
    REJECTED: "مرفوض",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderGit2 className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold">{ar.projectsTab.title}</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{ar.projectsTab.subtitle}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> {ar.projectsTab.newProject}</Button>
      </div>

      {members.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center">
          <FolderGit2 className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">{ar.projectsTab.noProjects}</p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {members.map((member) => {
          const p = member.project;
          return (
            <Card key={member.id} className="group overflow-hidden p-0">
              {p.coverImage ? (
                <div className="relative h-40 overflow-hidden">
                  <img src={p.coverImage} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
              ) : (
                <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-fuchsia-600/10">
                  <FolderGit2 className="h-12 w-12 text-primary/40" />
                </div>
              )}
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/projects/${p.slug}`} className="font-display font-bold hover:text-primary">{p.title}</Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">{p.domain} · {p.academicYear}</p>
                  </div>
                  <Badge className={cn("shrink-0", statusStyles[p.status] ?? "")}>{statusLabels[p.status] ?? p.status}</Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.abstract}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.techStack.slice(0, 5).map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{ar.projectsTab.submitProject}</DialogTitle></DialogHeader>
          <form onSubmit={createProject} className="space-y-4">
            <div className="space-y-2"><Label>{ar.projectsTab.title}</Label><Input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder={ar.projectsTab.titlePlaceholder} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{ar.projectsTab.domain}</Label>
                <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={form.domain} onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}>
                  {DOMAIN_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-2"><Label>{ar.projectsTab.academicYear}</Label><Input value={form.academicYear} onChange={(e) => setForm((f) => ({ ...f, academicYear: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>{ar.projectsTab.abstract}</Label><Textarea required rows={3} minLength={20} placeholder={ar.projectsTab.abstractPlaceholder} value={form.abstract} onChange={(e) => setForm((f) => ({ ...f, abstract: e.target.value }))} /></div>
            <div className="space-y-2"><Label>{ar.projectsTab.about}</Label><Textarea rows={4} placeholder={ar.projectsTab.aboutPlaceholder} value={form.about} onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))} /></div>
            <div className="space-y-2"><Label>{ar.projectsTab.techStack}</Label><Input value={form.techStack} onChange={(e) => setForm((f) => ({ ...f, techStack: e.target.value }))} placeholder={ar.projectsTab.techPlaceholder} /></div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2"><Label className="flex items-center gap-1.5"><Github className="h-3.5 w-3.5" /> {ar.projectsTab.repo}</Label><Input value={form.githubRepoUrl} onChange={(e) => setForm((f) => ({ ...f, githubRepoUrl: e.target.value }))} /></div>
              <div className="space-y-2"><Label className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> {ar.projectsTab.liveDemo}</Label><Input value={form.liveDemoUrl} onChange={(e) => setForm((f) => ({ ...f, liveDemoUrl: e.target.value }))} /></div>
              <div className="space-y-2"><Label className="flex items-center gap-1.5"><Video className="h-3.5 w-3.5" /> {ar.projectsTab.demoVideo}</Label><Input value={form.videoDemoUrl} onChange={(e) => setForm((f) => ({ ...f, videoDemoUrl: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>{ar.projectsTab.supervisor}</Label><Input value={form.advisorName} onChange={(e) => setForm((f) => ({ ...f, advisorName: e.target.value }))} /></div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {ar.projectsTab.submit}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
