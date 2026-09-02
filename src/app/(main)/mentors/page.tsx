"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Search, ShieldCheck, Star, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, initials } from "@/lib/utils";

interface Mentor {
  id: string;
  headline?: string | null;
  bio?: string | null;
  domains: string[];
  yearsOfExperience: number;
  isFree: boolean;
  avgRating: number;
  totalSessions: number;
  isVerified: boolean;
  user: { id: string; name: string; image?: string | null; bio?: string | null };
  _count?: { bookings: number };
}

const DOMAIN_FILTERS = ["Software Engineering", "AI & Machine Learning", "Data Science", "Cybersecurity", "DevOps & Cloud", "UI/UX", "Product"];

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (domain) params.set("domain", domain);
    try {
      const data = await fetch(`/api/mentors?${params.toString()}`).then((r) => r.json());
      setMentors(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [q, domain]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600/20 to-fuchsia-600/20 text-primary">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">Find a Mentor</h1>
            <p className="text-muted-foreground">Get guidance from industry professionals, alumni and academics.</p>
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
          <Input placeholder="Search mentors by name, skill, headline..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">
          {DOMAIN_FILTERS.map((d) => (
            <button
              key={d}
              onClick={() => setDomain(domain === d ? "" : d)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                domain === d
                  ? "border-primary/40 bg-gradient-to-r from-indigo-600/15 to-fuchsia-600/15 text-foreground"
                  : "border-border/60 text-muted-foreground hover:text-foreground",
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </motion.div>

      {loading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      ) : mentors.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-dashed border-border/70 p-16 text-center">
          <Compass className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-muted-foreground">No mentors match your search.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {mentors.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link href={`/mentors/${m.id}`} className="group block h-full">
                  <div className="flex h-full flex-col rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl hover:shadow-indigo-500/10">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16 ring-2 ring-primary/20 transition-shadow group-hover:ring-primary/40">
                        {m.user.image ? <AvatarImage src={m.user.image} alt={m.user.name} /> : null}
                        <AvatarFallback>{initials(m.user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-display font-bold group-hover:text-primary">{m.user.name}</span>
                          {m.isVerified && (
                            <Badge variant="outline" className="shrink-0 gap-1 text-indigo-500">
                              <ShieldCheck className="h-3 w-3" /> Verified
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{m.headline || m.user.bio || "Mentor"}</p>
                      </div>
                    </div>
                    <p className="mt-4 line-clamp-2 flex-1 text-sm text-muted-foreground">{m.bio || "Passionate about helping students grow."}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {m.domains.slice(0, 3).map((d) => <Badge key={d} variant="outline" className="text-xs">{d}</Badge>)}
                      {m.domains.length > 3 && <Badge variant="outline" className="text-xs">+{m.domains.length - 3}</Badge>}
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Star className={cn("h-3.5 w-3.5", m.avgRating > 0 ? "fill-amber-400 text-amber-400" : "text-muted-foreground/50")} />
                        {m.avgRating > 0 ? m.avgRating.toFixed(1) : "New"}
                      </span>
                      <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {m.totalSessions} sessions</span>
                      <span>{m.isFree ? <Badge className="bg-emerald-500/15 text-emerald-600">Free</Badge> : "Paid"}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
