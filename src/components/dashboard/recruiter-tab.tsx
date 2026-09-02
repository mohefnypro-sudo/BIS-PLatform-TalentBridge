"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Loader2,
  MapPin,
  Plus,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, formatCurrency, initials, timeAgo } from "@/lib/utils";
import { ar } from "@/lib/i18n";

interface Track {
  id: string;
  name: string;
  color?: string | null;
}

interface Job {
  id: string;
  title: string;
  companyName: string;
  description: string;
  location?: string | null;
  locationType: string;
  employmentType: string;
  isPaid: boolean;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency: string;
  applicationDeadline?: string | null;
  status: string;
  isTraining: boolean;
  skills: string[];
  createdAt: string;
  track?: Track | null;
  _count?: { applications: number };
}

interface Applicant {
  id: string;
  status: string;
  coverLetter?: string | null;
  createdAt: string;
  student: {
    id: string;
    user: { id: string; name: string; image?: string | null; email?: string | null };
    careerTrack?: Track | null;
  };
}

const APP_STATUS: Record<string, string> = {
  SUBMITTED: "bg-blue-500/15 text-blue-600",
  UNDER_REVIEW: "bg-amber-500/15 text-amber-600",
  INTERVIEW: "bg-purple-500/15 text-purple-600",
  ACCEPTED: "bg-emerald-500/15 text-emerald-600",
  REJECTED: "bg-red-500/15 text-red-600",
};

const JOB_STATUS: Record<string, string> = {
  DRAFT: "bg-slate-500/15 text-slate-600",
  OPEN: "bg-emerald-500/15 text-emerald-600",
  CLOSED: "bg-amber-500/15 text-amber-600",
  ARCHIVED: "bg-red-500/15 text-red-600",
};

export function RecruiterTab({ refreshKey }: { refreshKey: number }) {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applicantsFor, setApplicantsFor] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    companyName: "",
    location: "",
    locationType: "REMOTE",
    employmentType: "INTERNSHIP",
    trackId: "",
    salaryMin: "",
    salaryMax: "",
    currency: "USD",
    isPaid: true,
    isTraining: false,
    requirements: "",
    skills: "",
    applicationDeadline: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/jobs?mine=true");
      const data = await res.json();
      setJobs(data.jobs ?? []);
      setTracks(data.tracks ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  async function createJob(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          companyName: form.companyName,
          location: form.location || null,
          locationType: form.locationType,
          employmentType: form.employmentType,
          trackId: form.trackId || null,
          salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
          salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
          currency: form.currency,
          isPaid: form.isPaid,
          isTraining: form.isTraining,
          requirements: form.requirements.split("\n").filter(Boolean).slice(0, 30),
          skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 30),
          applicationDeadline: form.applicationDeadline ? new Date(form.applicationDeadline) : null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to create job");
      toast({ variant: "success", title: ar.recruiter.postJob, description: ar.recruiter.publishJob });
      setCreateOpen(false);
      setForm({
        title: "", description: "", companyName: "", location: "", locationType: "REMOTE",
        employmentType: "INTERNSHIP", trackId: "", salaryMin: "", salaryMax: "", currency: "USD",
        isPaid: true, isTraining: false, requirements: "", skills: "", applicationDeadline: "",
      });
      load();
    } catch (err) {
      toast({ variant: "destructive", title: ar.common.error, description: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  async function loadApplicants(job: Job) {
    setApplicantsFor(job);
    setLoadingApplicants(true);
    setApplicants([]);
    try {
      const data = await fetch(`/api/jobs/${job.id}/applications`).then((r) => r.json());
      setApplicants(Array.isArray(data) ? data : []);
    } finally {
      setLoadingApplicants(false);
    }
  }

  async function updateApplication(appId: string, status: string) {
    const res = await fetch(`/api/applications/${appId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      toast({ variant: "destructive", title: ar.common.error, description: (await res.json()).error ?? ar.common.error });
      return;
    }
    toast({ variant: "success", title: ar.recruiter.applicationUpdated, description: ar.recruiter.applicationUpdated });
    loadApplicants(applicantsFor!);
    load();
  }

  async function toggleJobStatus(job: Job) {
    const next = job.status === "OPEN" ? "CLOSED" : "OPEN";
    const res = await fetch(`/api/jobs/${job.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) {
      toast({ variant: "destructive", title: ar.common.error, description: (await res.json()).error ?? ar.common.error });
      return;
    }
    toast({ title: next === "CLOSED" ? ar.recruiter.jobClosed : ar.recruiter.jobOpened });
    load();
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-44 w-full" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold">{ar.recruiter.title}</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{ar.recruiter.subtitle}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> {ar.recruiter.postJob}</Button>
      </div>

      {jobs.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">{ar.recruiter.noJobs}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <AnimatePresence>
          {jobs.map((job) => (
            <motion.div key={job.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card className="p-0">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display font-bold">{job.title}</span>
                        <Badge className={cn("", JOB_STATUS[job.status] ?? "")}>{job.status.toLowerCase()}</Badge>
                        {job.isTraining && <Badge variant="outline">{ar.recruiter.trainingLabel}</Badge>}
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{job.companyName}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="shrink-0 gap-1.5" onClick={() => loadApplicants(job)}>
                      <Users className="h-4 w-4" /> {job._count?.applications ?? 0}
                    </Button>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {job.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>}
                    <span>{job.locationType.toLowerCase()}</span>
                    <span>{job.employmentType.toLowerCase().replaceAll("_", " ")}</span>
                    {job.isPaid && <span className="flex items-center gap-1"><Wallet className="h-3 w-3" /> {formatCurrency(job.salaryMin ?? job.salaryMax, job.currency)}</span>}
                    <span>{timeAgo(job.createdAt)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {job.skills.slice(0, 6).map((s) => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Button size="sm" variant={job.status === "OPEN" ? "outline" : "default"} onClick={() => toggleJobStatus(job)}>
                      {job.status === "OPEN" ? ar.recruiter.close : ar.recruiter.reopen}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{ar.recruiter.postJob}</DialogTitle></DialogHeader>
          <form onSubmit={createJob} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>{ar.recruiter.jobTitle}</Label><Input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder={ar.recruiter.jobTitlePlaceholder} /></div>
              <div className="space-y-2"><Label>{ar.recruiter.company}</Label><Input required value={form.companyName} onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>{ar.recruiter.description}</Label><Textarea required rows={4} minLength={30} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder={ar.recruiter.descriptionPlaceholder} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{ar.recruiter.locationType}</Label>
                <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.locationType} onChange={(e) => setForm((f) => ({ ...f, locationType: e.target.value }))}>
                  <option value="REMOTE">{ar.recruiter.remote}</option>
                  <option value="ONSITE">{ar.recruiter.onsite}</option>
                  <option value="HYBRID">{ar.recruiter.hybrid}</option>
                </select>
              </div>
              <div className="space-y-2"><Label>{ar.recruiter.cityLocation}</Label><Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} /></div>
              <div className="space-y-2">
                <Label>{ar.recruiter.employmentType}</Label>
                <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.employmentType} onChange={(e) => setForm((f) => ({ ...f, employmentType: e.target.value }))}>
                  <option value="FULL_TIME">{ar.recruiter.fullTime}</option>
                  <option value="PART_TIME">{ar.recruiter.partTime}</option>
                  <option value="INTERNSHIP">{ar.recruiter.internship}</option>
                  <option value="TRAINING">{ar.recruiter.training}</option>
                  <option value="CONTRACT">{ar.recruiter.contract}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>{ar.recruiter.careerTrack}</Label>
                <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.trackId} onChange={(e) => setForm((f) => ({ ...f, trackId: e.target.value }))}>
                  <option value="">{ar.recruiter.anyTrack}</option>
                  {tracks.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="space-y-2"><Label>{ar.recruiter.salaryMin}</Label><Input type="number" min="0" value={form.salaryMin} onChange={(e) => setForm((f) => ({ ...f, salaryMin: e.target.value }))} /></div>
              <div className="space-y-2"><Label>{ar.recruiter.salaryMax}</Label><Input type="number" min="0" value={form.salaryMax} onChange={(e) => setForm((f) => ({ ...f, salaryMax: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>{ar.recruiter.requirements}</Label><Textarea rows={3} value={form.requirements} onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))} /></div>
            <div className="space-y-2"><Label>{ar.recruiter.skills}</Label><Input value={form.skills} onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>{ar.recruiter.deadline}</Label><Input type="date" value={form.applicationDeadline} onChange={(e) => setForm((f) => ({ ...f, applicationDeadline: e.target.value }))} /></div>
              <div className="flex items-end gap-6 pb-1">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 rounded border-input" checked={form.isPaid} onChange={(e) => setForm((f) => ({ ...f, isPaid: e.target.checked }))} /> {ar.recruiter.paid}</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 rounded border-input" checked={form.isTraining} onChange={(e) => setForm((f) => ({ ...f, isTraining: e.target.checked }))} /> {ar.recruiter.trainingLabel}</label>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {ar.recruiter.publishJob}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!applicantsFor} onOpenChange={(open) => !open && setApplicantsFor(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{ar.recruiter.applicants} — {applicantsFor?.title}</DialogTitle></DialogHeader>
          {loadingApplicants ? (
            <div className="space-y-3"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div>
          ) : applicants.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{ar.recruiter.noApplications}</p>
          ) : (
            <div className="space-y-3">
              {applicants.map((app) => (
                <div key={app.id} className="rounded-xl border border-border/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {app.student.user.image ? <AvatarImage src={app.student.user.image} alt={app.student.user.name} /> : null}
                        <AvatarFallback>{initials(app.student.user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{app.student.user.name}</div>
                        <div className="text-xs text-muted-foreground">{app.student.user.email}</div>
                        {app.student.careerTrack && <Badge variant="outline" className="mt-1 text-xs">{app.student.careerTrack.name}</Badge>}
                      </div>
                    </div>
                    <Badge className={cn("", APP_STATUS[app.status] ?? "")}>{app.status.toLowerCase().replaceAll("_", " ")}</Badge>
                  </div>
                  {app.coverLetter && <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{app.coverLetter}</p>}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => updateApplication(app.id, "UNDER_REVIEW")}>{ar.recruiter.review}</Button>
                    <Button size="sm" variant="outline" onClick={() => updateApplication(app.id, "INTERVIEW")}>{ar.recruiter.interview}</Button>
                    <Button size="sm" className="gap-1" onClick={() => updateApplication(app.id, "ACCEPTED")}><CheckCircle2 className="h-3.5 w-3.5" /> {ar.recruiter.accept}</Button>
                    <Button size="sm" variant="destructive" className="gap-1" onClick={() => updateApplication(app.id, "REJECTED")}><XCircle className="h-3.5 w-3.5" /> {ar.recruiter.reject}</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
