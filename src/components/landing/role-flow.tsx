"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { ar } from "@/lib/i18n";

const roles = [
  {
    key: "student-grow",
    label: ar.roleFlow.studentGrow.label,
    emoji: "🌱",
    headline: ar.roleFlow.studentGrow.headline,
    points: ar.roleFlow.studentGrow.points,
    cta: ar.roleFlow.studentGrow.cta,
    href: "/register",
  },
  {
    key: "student-pro",
    label: ar.roleFlow.studentPro.label,
    emoji: "🚀",
    headline: ar.roleFlow.studentPro.headline,
    points: ar.roleFlow.studentPro.points,
    cta: ar.roleFlow.studentPro.cta,
    href: "/register",
  },
  {
    key: "mentor",
    label: ar.roleFlow.mentor.label,
    emoji: "🧭",
    headline: ar.roleFlow.mentor.headline,
    points: ar.roleFlow.mentor.points,
    cta: ar.roleFlow.mentor.cta,
    href: "/register?role=MENTOR",
  },
  {
    key: "recruiter",
    label: ar.roleFlow.recruiter.label,
    emoji: "💼",
    headline: ar.roleFlow.recruiter.headline,
    points: ar.roleFlow.recruiter.points,
    cta: ar.roleFlow.recruiter.cta,
    href: "/register?role=RECRUITER",
  },
];

export function RoleFlow() {
  return (
    <section className="relative py-24">
      <div className="bg-grid absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">{ar.roleFlow.badge}</span>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {ar.roleFlow.title} <span className="text-gradient">{ar.roleFlow.titleHighlight}</span>
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {roles.map((role, index) => (
            <Reveal key={role.key} delay={index * 0.08}>
              <motion.div
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-8 backdrop-blur-sm transition-colors hover:border-primary/30"
              >
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 blur-2xl transition-all group-hover:from-indigo-500/25 group-hover:to-fuchsia-500/25" />
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{role.emoji}</span>
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">{role.label}</Badge>
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-bold">{role.headline}</h3>
                  <ul className="mt-5 space-y-2.5">
                    {role.points.map((point) => (
                      <li key={point} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={role.href}
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-all hover:gap-2.5"
                  >
                    {role.cta} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
