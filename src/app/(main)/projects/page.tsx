"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FolderGit2, Search, Star, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  roleInProject?: string | null;
  isLead: boolean;
  student: { user: { id: string; name: string; image?: string | null } };
}

interface Project {
  id: string;
  title: string;
  slug: string;
  abstract: string;
  domain: string;
  academicYear?: string | null;
  techStack: string[];
  coverImage?: string | null;
  isFeatured: boolean;
  rating: number;
  members: Member[];
}

interface ProjectsResponse {
  projects: Project[];
  pagination: { page: number; limit: number; total: number; pages: number };
  facets: { techs: string[]; years: Array<string | null> };
}

export default function ProjectsPage() {
  const [data, setData] = useState<ProjectsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [tech, setTech] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (tech) params.set("tech", tech);
    if (year) params.set("year", year);
    params.set("page", String(page));
    try {
      const res = await fetch(`/api/projects?${params.toString()}`);
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [q, tech, year, page]);

  useEffect(() => {
    load();
  }, [load]);

  function reset() {
    setQ("");
    setTech("");
    setYear("");
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600/20 to-fuchsia-600/20 text-primary">
            <FolderGit2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">Graduation Projects</h1>
            <p className="text-muted-foreground">Discover capstone projects from students across every domain.</p>
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
          <Input
            placeholder="Search projects, domains, tech..."
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            value={tech}
            onChange={(e) => { setTech(e.target.value); setPage(1); }}
          >
            <option value="">All tech</option>
            {data?.facets.techs.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            value={year}
            onChange={(e) => { setYear(e.target.value); setPage(1); }}
          >
            <option value="">All years</option>
            {data?.facets.years.map((y) => <option key={y} value={y ?? ""}>{y}</option>)}
          </select>
          {(q || tech || year) && (
            <Button variant="ghost" onClick={reset}>Clear</Button>
          )}
        </div>
      </motion.div>

      {loading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-72 w-full" />)}
        </div>
      ) : data && data.projects.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-dashed border-border/70 p-16 text-center">
          <FolderGit2 className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-muted-foreground">No projects match your filters.</p>
          <Button className="mt-4" onClick={reset}>Reset filters</Button>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {data?.projects.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link href={`/projects/${p.slug}`} className="group block h-full">
                    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl hover:shadow-indigo-500/10">
                      <div className="relative h-44 overflow-hidden">
                        {p.coverImage ? (
                          <img src={p.coverImage} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="bg-grid flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-600/15 via-purple-600/15 to-fuchsia-600/15">
                            <FolderGit2 className="h-12 w-12 text-primary/40" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <Badge className="bg-white/90 text-foreground backdrop-blur">{p.domain}</Badge>
                          {p.isFeatured && <Badge className="bg-amber-400 text-amber-950">Featured</Badge>}
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="font-display text-lg font-bold group-hover:text-primary">{p.title}</h3>
                        <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-muted-foreground">{p.abstract}</p>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {p.techStack.slice(0, 4).map((t) => (
                            <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                          ))}
                          {p.techStack.length > 4 && <Badge variant="outline" className="text-xs">+{p.techStack.length - 4}</Badge>}
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {p.members.length} {p.members.length === 1 ? "member" : "members"}</span>
                          <span className="flex items-center gap-1.5">
                            <Star className={cn("h-3.5 w-3.5", p.rating > 0 ? "fill-amber-400 text-amber-400" : "text-muted-foreground/50")} />
                            {p.rating > 0 ? p.rating.toFixed(1) : "New"}
                          </span>
                        </div>
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
              <span className="px-3 text-sm text-muted-foreground">
                Page {data.pagination.page} of {data.pagination.pages}
              </span>
              <Button variant="outline" disabled={page >= data.pagination.pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
