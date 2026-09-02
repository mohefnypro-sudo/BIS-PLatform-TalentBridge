"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FolderCog, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { ar } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: ar.admin.stats, icon: BarChart3 },
  { href: "/admin/users", label: ar.admin.users, icon: ShieldCheck },
  { href: "/admin/projects", label: ar.admin.projects, icon: FolderCog },
  { href: "/admin/tracks", label: ar.admin.tracks, icon: Users },
  { href: "/admin/rollover", label: ar.admin.rollover, icon: RefreshCw },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <div className="mb-8 flex flex-wrap gap-2 rounded-2xl border border-border/60 bg-card/60 p-2 backdrop-blur-sm">
      {LINKS.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all",
              active
                ? "bg-gradient-to-r from-indigo-600/15 to-fuchsia-600/15 text-foreground ring-1 ring-primary/30"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <l.icon className="h-4 w-4" />
            {l.label}
          </Link>
        );
      })}
    </div>
  );
}
