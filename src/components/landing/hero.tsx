"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarCheck, GraduationCap, Rocket, Sparkles } from "lucide-react";
import { AuroraBackground } from "@/components/motion/aurora-background";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { TiltCard } from "@/components/motion/tilt-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ar } from "@/lib/i18n";

interface HeroProps {
  stats: { students: number; projects: number; mentors: number; jobs: number };
}

const floatingCards = [
  { icon: CalendarCheck, title: ar.hero.sessionApproved, body: ar.hero.sessionBody, color: "from-indigo-500 to-blue-500", className: "top-[18%] -left-6 lg:-left-16", delay: 0.2 },
  { icon: Rocket, title: ar.hero.gpLive, body: ar.hero.gpBody, color: "from-fuchsia-500 to-pink-500", className: "bottom-[24%] -left-10 lg:-left-20", delay: 0.5 },
  { icon: GraduationCap, title: ar.hero.appAccepted, body: ar.hero.appBody, color: "from-amber-400 to-orange-500", className: "top-[30%] -right-4 lg:-right-14", delay: 0.35 },
];

export function Hero({ stats }: HeroProps) {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-background pt-16">
      <AuroraBackground />
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="glass" className="mb-6 border-indigo-400/30 bg-indigo-500/10 text-indigo-200">
              <Sparkles className="h-3.5 w-3.5" />
              {ar.hero.badge}
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
          >
            {ar.hero.title1}
            <br />
            <span className="text-gradient">{ar.hero.title2}</span>
            <br />
            {ar.hero.title3}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
          >
            {ar.hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button asChild size="lg" variant="glow">
              <Link href="/register">
                {ar.hero.cta1} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/projects">{ar.hero.cta2}</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 grid max-w-lg grid-cols-2 gap-6 sm:grid-cols-4"
          >
            {[
              { value: stats.students, label: ar.hero.students, format: (n: number) => `${n}+` },
              { value: stats.projects, label: ar.hero.projects, format: (n: number) => `${n}+` },
              { value: stats.mentors, label: ar.hero.mentors, format: (n: number) => `${n}+` },
              { value: stats.jobs, label: ar.hero.roles, format: (n: number) => `${n}` },
            ].map((s) => (
              <div key={s.label} className="text-center sm:text-left">
                <div className="font-display text-3xl font-bold text-gradient">
                  <AnimatedNumber value={s.value} format={s.format} />
                </div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10 hidden h-[520px] lg:block"
        >
          <TiltCard className="h-full w-full" intensity={7}>
            <div className="glass-card relative h-full w-full overflow-hidden p-6">
              <div className="bg-grid absolute inset-0 opacity-30" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-400" />
                    <span className="h-3 w-3 rounded-full bg-amber-400" />
                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">dashboard.talentbridge</span>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs font-medium text-muted-foreground">{ar.hero.sessionBody}</div>
                    <div className="mt-1 font-display text-lg font-semibold">Sara Ahmed</div>
                    <div className="mt-3 flex gap-2">
                      {["Node.js", "PostgreSQL", "Docker", "AWS"].map((t) => (
                        <span key={t} className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs text-indigo-200">{t}</span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">{ar.roleFlow.studentGrow.headline}</span>
                      <span className="text-xs text-emerald-300">82%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/10">
                      <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {["HTTP & REST", "SQL Basics", "Auth (JWT)", "Cloud Deploy"].map((m, i) => (
                        <div key={m} className="flex items-center gap-2 rounded-lg bg-white/5 px-2.5 py-2 text-xs">
                          <span className={`h-2 w-2 rounded-full ${i < 3 ? "bg-emerald-400" : "bg-amber-400"}`} />
                          {m}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs text-muted-foreground">{ar.projectsTab.title}</div>
                      <div className="mt-1 text-sm font-semibold">MedVision AI</div>
                      <div className="mt-2 text-[10px] text-indigo-300">{ar.admin.featured}</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs text-muted-foreground">{ar.mentorSpotlight.sessions}</div>
                      <div className="mt-1 font-display text-2xl font-bold text-gradient">12</div>
                      <div className="mt-1 text-[10px] text-muted-foreground">{ar.overview.avgRating}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TiltCard>

          {floatingCards.map((card) => (
            <motion.div
              key={card.title}
              className={`absolute z-20 ${card.className}`}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: card.delay }}
            >
              <div className="animate-float">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3.5 shadow-2xl backdrop-blur-xl">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color}`}>
                    <card.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{card.title}</div>
                    <div className="text-xs text-white/60">{card.body}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
