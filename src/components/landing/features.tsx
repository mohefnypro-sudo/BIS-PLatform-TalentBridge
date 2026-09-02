"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpenCheck, Briefcase, Compass, Rocket } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SpotlightCard } from "@/components/motion/spotlight-card";
import { cn } from "@/lib/utils";
import { ar } from "@/lib/i18n";

const features = [
  {
    icon: Rocket,
    title: ar.features.feature1Title,
    body: ar.features.feature1Body,
    href: "/projects",
    gradient: "from-indigo-500 to-blue-500",
    ring: "group-hover:shadow-indigo-500/20",
    stats: ar.features.feature1Stats,
  },
  {
    icon: BookOpenCheck,
    title: ar.features.feature2Title,
    body: ar.features.feature2Body,
    href: "/register",
    gradient: "from-fuchsia-500 to-pink-500",
    ring: "group-hover:shadow-fuchsia-500/20",
    stats: ar.features.feature2Stats,
  },
  {
    icon: Compass,
    title: ar.features.feature3Title,
    body: ar.features.feature3Body,
    href: "/mentors",
    gradient: "from-amber-400 to-orange-500",
    ring: "group-hover:shadow-amber-500/20",
    stats: ar.features.feature3Stats,
  },
  {
    icon: Briefcase,
    title: ar.features.feature4Title,
    body: ar.features.feature4Body,
    href: "/jobs",
    gradient: "from-emerald-400 to-teal-500",
    ring: "group-hover:shadow-emerald-500/20",
    stats: ar.features.feature4Stats,
  },
];

export function Features() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">{ar.features.badge}</span>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {ar.features.title} <span className="text-gradient">{ar.features.titleHighlight}</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {ar.features.subtitle}
          </p>
        </Reveal>

        <Stagger className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <StaggerItem key={f.title}>
              <Link href={f.href} className="block h-full">
                <SpotlightCard className={cn("h-full rounded-3xl border border-border/60 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-2xl", f.ring)}>
                  <div className={cn("mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg", f.gradient)}>
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {f.stats.map((s) => (
                      <span key={s} className="rounded-full bg-muted/70 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                        {s}
                      </span>
                    ))}
                  </div>
                </SpotlightCard>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-16 grid gap-4 sm:grid-cols-3"
        >
          {[
            [ar.features.fromOrientation, ar.features.fromOrientationBody],
            [ar.features.toShowcase, ar.features.toShowcaseBody],
            [ar.features.toPlacement, ar.features.toPlacementBody],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border border-border/50 bg-muted/30 p-6 text-center">
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" />
              <h4 className="font-display font-semibold">{title}</h4>
              <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
