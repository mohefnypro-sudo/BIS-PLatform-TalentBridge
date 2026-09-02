"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  CalendarCheck,
  Compass,
  FolderGit2,
  Rocket,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, initials } from "@/lib/utils";
import { ar } from "@/lib/i18n";

interface MeData {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
  status: string;
  studentProfile?: {
    id: string;
    level: string;
    tier: string;
    headline?: string | null;
    showcase: boolean;
    careerTrack?: { name: string; color?: string | null } | null;
    _count?: { milestones: number };
  } | null;
  mentorProfile?: {
    id: string;
    headline?: string | null;
    isVerified: boolean;
    domains: string[];
    _count?: { bookings: number };
  } | null;
}

interface OverviewProps {
  role: string;
  onNavigate: (tab: string) => void;
  refreshKey: number;
  onDataChange: () => void;
}

export function OverviewTab({ role, onNavigate, refreshKey, onDataChange }: OverviewProps) {
  const [me, setMe] = useState<MeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<{ bookings: number; applications: number; projects: number; notifications: number }>({
    bookings: 0,
    applications: 0,
    projects: 0,
    notifications: 0,
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        setMe(data);
        if (data.studentProfile) {
          const [notifications, applications] = await Promise.all([
            fetch("/api/notifications/count").then((r) => r.json()).catch(() => ({ count: 0 })),
            fetch("/api/applications").then((r) => r.json()).catch(() => []),
          ]);
          setCounts((c) => ({ ...c, notifications: notifications.count ?? 0, applications: applications.length ?? 0 }));
        } else if (data.mentorProfile) {
          const notifications = await fetch("/api/notifications/count").then((r) => r.json()).catch(() => ({ count: 0 }));
          setCounts((c) => ({ ...c, notifications: notifications.count ?? 0 }));
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [refreshKey]);

  useEffect(() => {
    if (!me) return;
    const current = me;
    async function loadCounts() {
      if (current.studentProfile) {
        const bookings = await fetch("/api/bookings").then((r) => r.json()).catch(() => []);
        setCounts((c) => ({ ...c, bookings: bookings.length ?? 0 }));
      } else if (current.mentorProfile) {
        const bookings = await fetch("/api/bookings").then((r) => r.json()).catch(() => []);
        setCounts((c) => ({ ...c, bookings: bookings.length ?? 0 }));
      }
    }
    loadCounts();
  }, [me]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      </div>
    );
  }

  const isStudent = role === "STUDENT";
  const isMentor = role === "MENTOR";
  const isRecruiter = role === "RECRUITER";
  const tier = me?.studentProfile?.tier ?? "GROWTH";

  const quickActions = isStudent
    ? [
        { label: ar.overview.addMilestone, tab: "growth", icon: Sparkles },
        { label: ar.overview.editPortfolio, tab: "portfolio", icon: Rocket },
        { label: ar.overview.myProjects, tab: "projects", icon: FolderGit2 },
        { label: ar.overview.browseMentors, href: "/mentors", icon: Compass },
        { label: ar.overview.findJobs, href: "/jobs", icon: Briefcase },
      ]
    : isMentor
      ? [
          { label: ar.overview.manageAvailability, tab: "availability", icon: CalendarCheck },
          { label: ar.overview.bookingRequests, tab: "bookings", icon: Compass },
          { label: ar.overview.mentorDirectory, href: "/mentors", icon: Compass },
        ]
      : [
          { label: ar.overview.postJob, tab: "jobs", icon: Briefcase },
          { label: ar.overview.reviewApplicants, tab: "jobs", icon: TrendingUp },
          { label: ar.overview.browseProjects, href: "/projects", icon: FolderGit2 },
        ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 p-8 text-white shadow-2xl shadow-indigo-600/20">
        <div className="bg-grid absolute inset-0 opacity-20" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-4 ring-white/30">
              {me?.image ? <AvatarImage src={me.image} alt={me?.name ?? ""} /> : null}
              <AvatarFallback className="text-xl">{initials(me?.name ?? "U")}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-display text-2xl font-bold">{ar.overview.welcomeBack}, {me?.name?.split(" ")[0]}</h1>
              <p className="text-indigo-100">
                {isStudent
                  ? `${me?.studentProfile?.level ?? ar.overview.student} · ${tier} ${ar.dashboard.portfolio}`
                  : isMentor
                    ? me?.mentorProfile?.headline ?? ar.overview.mentor
                    : ar.overview.recruiter}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="glass">{me?.status}</Badge>
                {isStudent && me?.studentProfile?.careerTrack && (
                  <Badge variant="glass" className="border-emerald-400/40 text-emerald-100">
                    {me.studentProfile.careerTrack.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => onNavigate("notifications")} className="bg-white/15 backdrop-blur hover:bg-white/25">
              <BellIcon /> {ar.overview.notifications} {counts.notifications > 0 && `(${counts.notifications})`}
            </Button>
            {isStudent && (
              <Button asChild className="bg-white text-indigo-700 hover:bg-indigo-50">
                <Link href={`/u/${me?.studentProfile?.id}`}>{ar.overview.viewPortfolio}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isStudent && (
          <>
            <StatCard icon={Sparkles} label={ar.overview.trackProgress} value={`${me?.studentProfile?.careerTrack?.name ?? ar.overview.noTrack}`} sub={me?.studentProfile?.showcase ? ar.overview.portfolioPublic : ar.overview.portfolioPrivate} />
            <StatCard icon={CalendarCheck} label={ar.overview.activeSessions} value={String(counts.bookings)} sub={ar.overview.bookings} />
            <StatCard icon={Briefcase} label={ar.overview.applications} value={String(counts.applications)} sub={ar.overview.applications} />
            <StatCard icon={BellIcon} label={ar.overview.notifications} value={String(counts.notifications)} sub={ar.overview.unread} />
          </>
        )}
        {isMentor && (
          <>
            <StatCard icon={CalendarCheck} label={ar.overview.sessions} value={String(counts.bookings)} sub={ar.overview.activeSessions} />
            <StatCard icon={TrendingUp} label={ar.overview.avgRating} value={me?.mentorProfile ? "—" : "—"} sub={ar.overview.avgRating} />
            <StatCard icon={BellIcon} label={ar.overview.notifications} value={String(counts.notifications)} sub={ar.overview.unread} />
            <StatCard icon={Compass} label={ar.overview.verified} value={me?.mentorProfile?.isVerified ? "نعم" : ar.overview.pending} sub={ar.overview.mentorStatus} />
          </>
        )}
        {isRecruiter && (
          <>
            <StatCard icon={Briefcase} label={ar.overview.workspace} value={ar.dashboard.jobs} sub={ar.overview.postManage} />
            <StatCard icon={TrendingUp} label={ar.overview.talent} value={ar.overview.directory} sub={ar.overview.talent} />
            <StatCard icon={BellIcon} label={ar.overview.notifications} value={String(counts.notifications)} sub={ar.overview.unread} />
            <StatCard icon={FolderGit2} label={ar.overview.talent} value={ar.overview.directory} sub={ar.overview.browseMentors} />
          </>
        )}
      </div>

      {isStudent && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{ar.overview.quickActions}</CardTitle>
            <span className="text-xs text-muted-foreground">{ar.overview.growDaily}</span>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                onClick={() => (action.tab ? onNavigate(action.tab) : undefined)}
                asChild={!action.tab}
              >
                {action.href ? <Link href={action.href} className="flex items-center gap-2"><action.icon className="h-4 w-4" /> {action.label} <ArrowRight className="h-3.5 w-3.5" /></Link> : <><action.icon className="h-4 w-4" /> {action.label}</>}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {isStudent && me?.studentProfile?.careerTrack && (
        <Card>
          <CardHeader>
            <CardTitle>{ar.overview.yourRoadmap}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{me.studentProfile.careerTrack.name}</span>
              <span className="font-semibold text-primary">{ar.overview.inProgress}</span>
            </div>
            <Progress className="mt-3" value={35} />
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub: string }) {
  return (
    <Card className={cn("p-0")}>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600/15 to-fuchsia-600/15 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate font-display text-lg font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{sub}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function BellIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
