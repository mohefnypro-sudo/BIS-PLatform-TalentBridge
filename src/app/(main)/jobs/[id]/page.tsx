"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Send,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { cn, formatCurrency } from "@/lib/utils";

interface Job {
  id: string;
  title: string;
  description: string;
  companyName: string;
  companyLogo?: string | null;
  companyWebsite?: string | null;
  locationType: string;
  location?: string | null;
  employmentType: string;
  isPaid: boolean;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency: string;
  applicationDeadline?: string | null;
  status: string;
  isTraining: boolean;
  requirements: string[];
  skills: string[];
  views: number;
  createdAt: string;
  track?: { name: string; color?: string | null } | null;
  recruiter: { id: string; name: string; email: string };
  _count?: { applications: number };
}

export default function JobPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/jobs/${id}`);
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        setJob(await res.json());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function apply(e: React.FormEvent) {
    e.preventDefault();
    setApplying(true);
    try {
      const res = await fetch(`/api/jobs/${id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverLetter: coverLetter || null }),
      });
      if (res.status === 401) {
        router.push(`/login?callbackUrl=/jobs/${id}`);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Application failed");
      setApplied(true);
      toast({ variant: "success", title: "Application sent 🎉", description: "Your profile snapshot has been shared with the recruiter." });
    } catch (err) {
      toast({ variant: "destructive", title: "Could not apply", description: (err as Error).message });
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Skeleton className="h-40 w-full" />
        <div className="mt-8 space-y-3"><Skeleton className="h-6 w-2/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></div>
      </div>
    );
  }

  if (notFound || !job) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <Briefcase className="mx-auto h-14 w-14 text-muted-foreground/40" />
        <h1 className="mt-4 font-display text-2xl font-bold">Job not found</h1>
        <Button asChild className="mt-6"><a href="/jobs">Back to jobs</a></Button>
      </div>
    );
  }

  const deadlinePassed = job.applicationDeadline && new Date(job.applicationDeadline) < new Date();
  const isOpen = job.status === "OPEN" && !deadlinePassed;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-4xl px-4 pb-20 pt-10 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="mb-6 text-muted-foreground">
        <a href="/jobs"><ArrowLeft className="h-4 w-4" /> All jobs</a>
      </Button>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-fuchsia-600/10 p-8"
      >
        <div className="bg-grid absolute inset-0 opacity-20" />
        <div className="relative flex flex-wrap items-center gap-6">
          {job.companyLogo ? (
            <img src={job.companyLogo} alt={job.companyName} className="h-20 w-20 rounded-2xl border border-border/60 bg-background object-contain p-1" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-background text-primary">
              <Building2 className="h-9 w-9" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl font-bold">{job.title}</h1>
              {job.isTraining && <Badge className="bg-amber-500/15 text-amber-600">Training</Badge>}
              {isOpen ? <Badge className="bg-emerald-500/15 text-emerald-600">Open</Badge> : <Badge variant="secondary">Closed</Badge>}
            </div>
            <p className="mt-1 font-medium text-muted-foreground">{job.companyName}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {job.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {job.location}</span>}
              <span>{job.locationType.toLowerCase()}</span>
              <span>{job.employmentType.toLowerCase().replaceAll("_", " ")}</span>
              {job.track && <Badge variant="outline">{job.track.name}</Badge>}
              {job.isPaid && (
                <span className="flex items-center gap-1.5 font-medium text-emerald-600">
                  <Wallet className="h-4 w-4" /> {formatCurrency(job.salaryMin ?? job.salaryMax, job.currency)}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-8">
          <section>
            <h2 className="font-display text-lg font-bold">About the role</h2>
            <div className="mt-2 whitespace-pre-line text-muted-foreground">{job.description}</div>
          </section>

          {job.requirements.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-bold">Requirements</h2>
              <ul className="mt-3 space-y-2">
                {job.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {r}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {job.skills.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-bold">Skills</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {job.skills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
              </div>
            </section>
          )}

          <section>
            <h2 className="font-display text-lg font-bold">Recruiter</h2>
            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-border/60 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600/20 to-fuchsia-600/20 text-primary">
                {job.recruiter.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{job.recruiter.name}</p>
                <p className="text-xs text-muted-foreground">{job.recruiter.email}</p>
              </div>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm">
              <h3 className="font-display font-bold">At a glance</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-muted-foreground"><Briefcase className="h-4 w-4" /> Type</dt>
                  <dd className="font-medium">{job.employmentType.toLowerCase().replaceAll("_", " ")}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> Setup</dt>
                  <dd className="font-medium">{job.locationType.toLowerCase()}</dd>
                </div>
                {job.isPaid && (
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-2 text-muted-foreground"><Wallet className="h-4 w-4" /> Pay</dt>
                    <dd className="font-medium">{formatCurrency(job.salaryMin ?? job.salaryMax, job.currency)}</dd>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="h-4 w-4" /> Deadline</dt>
                  <dd className="font-medium">{job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : "Rolling"}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /> Posted</dt>
                  <dd className="font-medium">{new Date(job.createdAt).toLocaleDateString()}</dd>
                </div>
              </dl>
            </div>

            {applied ? (
              <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
                <BadgeCheck className="mx-auto h-10 w-10 text-emerald-500" />
                <p className="mt-3 font-medium">Application submitted</p>
                <p className="mt-1 text-sm text-muted-foreground">Track its status in your dashboard.</p>
                <Button asChild className="mt-4 w-full" variant="outline">
                  <a href="/dashboard?tab=applications">View applications</a>
                </Button>
              </div>
            ) : isOpen ? (
              <form onSubmit={apply} className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm">
                <h3 className="font-display font-bold">Apply now</h3>
                <p className="mt-1 text-sm text-muted-foreground">Your portfolio snapshot is attached automatically.</p>
                <div className="mt-4 space-y-2">
                  <Label>Cover letter (optional)</Label>
                  <Textarea rows={5} placeholder="Why are you a great fit?" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} />
                </div>
                <Button type="submit" className="mt-4 w-full" disabled={applying}>
                  {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Submit application
                </Button>
              </form>
            ) : (
              <div className="rounded-3xl border border-border/60 bg-card/60 p-6 text-center">
                <Clock className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="mt-3 font-medium">Applications closed</p>
                <p className="mt-1 text-sm text-muted-foreground">{deadlinePassed ? "The deadline has passed." : "This position is no longer open."}</p>
              </div>
            )}
          </motion.div>
        </aside>
      </div>
    </motion.div>
  );
}
