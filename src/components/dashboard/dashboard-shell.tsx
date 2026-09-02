"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bell,
  BookOpenCheck,
  Briefcase,
  CalendarDays,
  Compass,
  FolderGit2,
  LayoutDashboard,
  Settings,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { OverviewTab } from "@/components/dashboard/overview-tab";
import { GrowthTab } from "@/components/dashboard/growth-tab";
import { PortfolioTab } from "@/components/dashboard/portfolio-tab";
import { ProjectsTab } from "@/components/dashboard/projects-tab";
import { BookingsTab } from "@/components/dashboard/bookings-tab";
import { ApplicationsTab } from "@/components/dashboard/applications-tab";
import { NotificationsTab } from "@/components/dashboard/notifications-tab";
import { AvailabilityTab } from "@/components/dashboard/availability-tab";
import { RecruiterTab } from "@/components/dashboard/recruiter-tab";
import { cn } from "@/lib/utils";
import { ar } from "@/lib/i18n";

type Role = "STUDENT" | "MENTOR" | "RECRUITER" | "ADMIN";

interface TabDef {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
}

const TABS: TabDef[] = [
  { id: "overview", label: ar.dashboard.overview, icon: LayoutDashboard, roles: ["STUDENT", "MENTOR", "RECRUITER"] },
  { id: "growth", label: ar.dashboard.growthTrack, icon: Sparkles, roles: ["STUDENT"] },
  { id: "portfolio", label: ar.dashboard.portfolio, icon: BookOpenCheck, roles: ["STUDENT"] },
  { id: "projects", label: ar.dashboard.graduationProjects, icon: FolderGit2, roles: ["STUDENT"] },
  { id: "availability", label: ar.dashboard.availability, icon: CalendarDays, roles: ["MENTOR"] },
  { id: "bookings", label: ar.dashboard.sessions, icon: Compass, roles: ["STUDENT", "MENTOR"] },
  { id: "jobs", label: ar.dashboard.jobs, icon: Briefcase, roles: ["RECRUITER"] },
  { id: "applications", label: ar.dashboard.applications, icon: Briefcase, roles: ["STUDENT"] },
  { id: "notifications", label: ar.dashboard.notifications, icon: Bell, roles: ["STUDENT", "MENTOR", "RECRUITER"] },
];

export function DashboardShell({ initialTab }: { initialTab?: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (session?.user?.role ?? "STUDENT") as Role;

  const tabs = useMemo(() => TABS.filter((t) => t.roles.includes(role)), [role]);
  const [activeTab, setActiveTab] = useState<string>(
    tabs.some((t) => t.id === initialTab) ? initialTab! : tabs[0]?.id ?? "overview",
  );

  useEffect(() => {
    const fromParams = searchParams.get("tab");
    if (fromParams && tabs.some((t) => t.id === fromParams)) {
      setActiveTab(fromParams);
    }
  }, [searchParams, tabs]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  function switchTab(tab: string) {
    setActiveTab(tab);
    router.replace(`/dashboard?tab=${tab}`, { scroll: false });
  }

  const loadKey = useCallback(() => Date.now(), []);
  const [refreshKey, setRefreshKey] = useState(0);
  const bump = () => setRefreshKey((k) => k + 1);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border border-border/60 bg-card/60 p-3 backdrop-blur-sm">
            <div className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {ar.dashboard.menu}
            </div>
            <nav className="flex flex-col gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-indigo-600/15 to-fuchsia-600/15 text-foreground ring-1 ring-primary/30"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <tab.icon className={cn("h-4 w-4", activeTab === tab.id && "text-primary")} />
                  {tab.label}
                </button>
              ))}
            </nav>
            <div className="mt-4 border-t border-border/50 pt-3">
              <button
                onClick={() => switchTab("settings")}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  activeTab === "settings"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <Settings className="h-4 w-4" />
                {ar.dashboard.settings}
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {activeTab === "overview" && <OverviewTab role={role} onNavigate={switchTab} refreshKey={refreshKey} onDataChange={bump} />}
          {activeTab === "growth" && <GrowthTab refreshKey={refreshKey} />}
          {activeTab === "portfolio" && <PortfolioTab refreshKey={refreshKey} onDataChange={bump} />}
          {activeTab === "projects" && <ProjectsTab refreshKey={refreshKey} />}
          {activeTab === "availability" && <AvailabilityTab refreshKey={refreshKey} />}
          {activeTab === "bookings" && <BookingsTab role={role} refreshKey={refreshKey} onDataChange={bump} />}
          {activeTab === "jobs" && <RecruiterTab refreshKey={refreshKey} />}
          {activeTab === "applications" && <ApplicationsTab refreshKey={refreshKey} />}
          {activeTab === "notifications" && <NotificationsTab refreshKey={refreshKey} />}
          {activeTab === "settings" && <PortfolioTab settingsMode refreshKey={refreshKey} onDataChange={bump} />}
          <p className="mt-6 hidden text-center text-xs text-muted-foreground lg:block">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Session #{loadKey()} · {ar.dashboard.refreshCycle} {refreshKey}
          </p>
        </main>
      </div>
    </div>
  );
}
