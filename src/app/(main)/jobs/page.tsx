"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Building2, CalendarDays, MapPin, Search, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCurrency } from "@/lib/utils";

interface Track {
  id: string;
  name: string;
  color?: string | null;
}

interface Job {
  id: string;
  title: string;
  companyName: string;
  companyLogo?: string | null;
  description: string;
  location?: string | null;
  locationType: string;
  employmentType: string;
  isPaid: boolean;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency: string;
  applicationDeadline?: string | null;
  isTraining: boolean;
  skills: string[];
  createdAt: string;
  track?: Track | null;
  _count?: { applications: number };
}

interface JobsResponse {
  jobs: Job[];
  pagination: { page: number; limit: number; total: number; pages: number };
  tracks: Track[];
}

export default function JobsPage() {
  const [data, setData] = useState<JobsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [track, setTrack] = useState("");
  const [type, setType] = useState("");
  const [training, setTraining] = useState(false);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (track) params.set("track", track);
    if (type) params.set("type", type);
    if (training) params.set("training", "true");
    params.set("page", String(page));
    try {
      const res = await fetch(`/api/jobs?${params.toString()}`);
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [q, track, type, training, page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600/20 to-fuchsia-600/20 text-primary">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">Jobs & Internships</h1>
            <p className="text-muted-foreground">Kickstart your career with roles from vetted recruiters and partners.</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mt-8 flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm lg:flex-row lg:items-center"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search titles, companies, skills..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select className="h-10 rounded-lg border border-input bg-background px-3 text-sm" value={track} onChange={(e) => { setTrack(e.target.value); setPage(1); }}>
            <option value="">All tracks</option>
            {data?.tracks.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select className="h-10 rounded-lg border border-input bg-background px-3 text-sm" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
            <option value="">All types</option>
            <option value="FULL_TIME">Full-time</option>
            <option value="PART_TIME">Part-time</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="TRAINING">Training</option>
            <option value="CONTRACT">Contract</option>
          </select>
          <button
            onClick={() => { setTraining((v) => !v); setPage(1); }}
            className={cn(
              "h-10 rounded-lg border px-3 text-sm font-medium transition-all",
              training ? "border-primary/40 bg-primary/10 text-foreground" : "border-input bg-background text-muted-foreground",
            )}
          >
            Training
          </button>
        </div>
      </motion.div>

      {loading ? (
        <div className="mt-8 space-y-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-36 w-full" />)}
        </div>
      ) : data && data.jobs.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-dashed border-border/70 p-16 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-muted-foreground">No jobs match your filters.</p>
        </div>
      ) : (
        <>
          <div className="mt-8 space-y-4">
            <AnimatePresence>
              {data?.jobs.map((job, i) => (
                <motion.div key={job.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Link href={`/jobs/${job.id}`} className="group block">
                    <div className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xl hover:shadow-indigo-500/5 sm:flex-row sm:items-center">
                      {job.companyLogo ? (
                        <img src={job.companyLogo} alt={job.companyName} className="h-16 w-16 shrink-0 rounded-2xl border border-border/60 object-contain p-1" />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600/15 to-fuchsia-600/15 text-primary">
                          <Building2 className="h-7 w-7" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-lg font-bold group-hover:text-primary">{job.title}</h3>
                          {job.isTraining && <Badge className="bg-amber-500/15 text-amber-600">Training</Badge>}
                          {job.track && <Badge variant="outline" className="text-xs">{job.track.name}</Badge>}
                        </div>
                        <p className="mt-0.5 text-sm font-medium text-muted-foreground">{job.companyName}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          {job.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>}
                          <span>{job.locationType.toLowerCase()}</span>
                          <span>{job.employmentType.toLowerCase().replaceAll("_", " ")}</span>
                          {job.isPaid && (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <Wallet className="h-3 w-3" /> {formatCurrency(job.salaryMin ?? job.salaryMax, job.currency)}
                            </span>
                          )}
                          {job.applicationDeadline && (
                            <span className="flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" /> Deadline {new Date(job.applicationDeadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-4">
                        <div className="hidden text-right sm:block">
                          <div className="font-display text-lg font-bold">{job._count?.applications ?? 0}</div>
                          <div className="text-xs text-muted-foreground">applicants</div>
                        </div>
                        <Button asChild size="sm">
                          <span>View & apply</span>
                        </Button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {data && data.pagination.pages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="px-3 text-sm text-muted-foreground">Page {data.pagination.page} of {data.pagination.pages}</span>
              <Button variant="outline" disabled={page >= data.pagination.pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
