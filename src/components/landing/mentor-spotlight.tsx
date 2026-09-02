"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Video } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/utils";
import { ar } from "@/lib/i18n";

interface Mentor {
  id: string;
  headline: string | null;
  domains: string[];
  avgRating: number;
  totalSessions: number;
  isFree: boolean;
  hourlyRate: number | null;
  sessionLengths: number[];
  user: { name: string; image: string | null; bio: string | null };
}

export function MentorSpotlight({ mentors }: { mentors: Mentor[] }) {
  if (mentors.length === 0) return null;

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">{ar.mentorSpotlight.badge}</span>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {ar.mentorSpotlight.title} <span className="text-gradient">{ar.mentorSpotlight.titleHighlight}</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {ar.mentorSpotlight.subtitle}
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {mentors.map((m, i) => (
            <Reveal key={m.id} delay={i * 0.08}>
              <motion.div whileHover={{ y: -6 }} className="group rounded-3xl border border-border/60 bg-card p-6 text-center transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10">
                <div className="relative mx-auto w-fit">
                  <Avatar className="h-20 w-20 ring-4 ring-primary/20 transition-all group-hover:ring-primary/40">
                    {m.user.image ? <AvatarImage src={m.user.image} alt={m.user.name} /> : null}
                    <AvatarFallback className="text-xl">{initials(m.user.name)}</AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white ring-2 ring-background">
                    <Star className="h-3 w-3 fill-current" />
                  </span>
                </div>
                <h3 className="mt-4 font-display font-semibold">{m.user.name}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{m.headline ?? m.user.bio ?? ar.nav.mentors}</p>
                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  {m.domains.slice(0, 2).map((d) => (
                    <span key={d} className="rounded-full bg-muted/70 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {d}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {m.avgRating.toFixed(1)}</span>
                  <span className="flex items-center gap-1"><Video className="h-3.5 w-3.5" /> {m.totalSessions} {ar.mentorSpotlight.sessions}</span>
                  <Badge variant={m.isFree ? "success" : "muted"}>{m.isFree ? ar.public.free : `$${m.hourlyRate ?? 0}/hr`}</Badge>
                </div>
                <Link
                  href={`/mentors/${m.id}`}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-border py-2.5 text-sm font-semibold transition-all hover:border-primary/50 hover:bg-primary/5"
                >
                  {ar.mentorSpotlight.viewProfile}
                </Link>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
