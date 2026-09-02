"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Briefcase, Eye, MapPin, Send, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDate, formatCurrency, timeAgo } from "@/lib/utils";
import { ar } from "@/lib/i18n";

interface Application {
  id: string;
  status: string;
  coverLetter?: string | null;
  createdAt: string;
  job: {
    id: string;
    title: string;
    companyName: string;
    location?: string | null;
    locationType: string;
    employmentType: string;
    isPaid: boolean;
    salaryMin?: number | null;
    salaryMax?: number | null;
    currency: string;
    applicationDeadline?: string | null;
    status: string;
    track?: { name: string; color?: string | null } | null;
  };
}

export function ApplicationsTab({ refreshKey }: { refreshKey: number }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetch("/api/applications").then((r) => r.json());
      setApplications(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const statusStyles: Record<string, string> = {
    SUBMITTED: "bg-blue-500/15 text-blue-600",
    UNDER_REVIEW: "bg-amber-500/15 text-amber-600",
    INTERVIEW: "bg-purple-500/15 text-purple-600",
    ACCEPTED: "bg-emerald-500/15 text-emerald-600",
    REJECTED: "bg-red-500/15 text-red-600",
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-bold">{ar.applications.title}</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{ar.applications.subtitle}</p>
      </div>

      {applications.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center">
          <Send className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">{ar.applications.noApplications}</p>
          <Button asChild className="mt-4">
            <Link href="/jobs">{ar.applications.browseRoles}</Link>
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {applications.map((app) => (
          <Card key={app.id} className="p-0 transition-shadow hover:shadow-lg">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/jobs/${app.job.id}`} className="font-display font-bold hover:text-primary">{app.job.title}</Link>
                  <p className="text-sm text-muted-foreground">{app.job.companyName}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {app.job.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {app.job.location}</span>}
                    <span>{app.job.locationType.toLowerCase()}</span>
                    <span>{app.job.employmentType.toLowerCase().replaceAll("_", " ")}</span>
                    {app.job.isPaid && (
                      <span className="flex items-center gap-1">
                        <Wallet className="h-3 w-3" /> {formatCurrency(app.job.salaryMin ?? app.job.salaryMax, app.job.currency)}
                      </span>
                    )}
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {ar.applications.applied} {timeAgo(app.createdAt)}</span>
                  </div>
                  {app.coverLetter && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{app.coverLetter}</p>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Badge className={cn("", statusStyles[app.status] ?? "")}>{app.status.toLowerCase().replaceAll("_", " ")}</Badge>
                  {app.job.applicationDeadline && (
                    <span className="text-xs text-muted-foreground">{ar.public.deadline} {formatDate(app.job.applicationDeadline)}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
