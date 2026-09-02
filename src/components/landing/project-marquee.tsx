"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { Marquee } from "@/components/motion/marquee";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { ar } from "@/lib/i18n";

interface Project {
  id: string;
  title: string;
  abstract: string;
  domain: string;
  techStack: string[];
  coverImage: string | null;
  rating: number | null;
  slug: string;
  owner: { user: { name: string; image: string | null } } | null;
}

export function ProjectMarquee({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;
  const doubled = [...projects, ...projects];

  return (
    <section className="relative overflow-hidden py-24">
      <Reveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">{ar.projectMarquee.badge}</span>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              {ar.projectMarquee.title} <span className="text-gradient">{ar.projectMarquee.titleHighlight}</span>
            </h2>
          </div>
          <Link
            href="/projects"
            className="hidden items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex"
          >
            {ar.projectMarquee.viewAll} <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </Reveal>

      <div className="mt-12 space-y-8 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <Marquee speed={55}>
          {doubled.map((p, i) => (
            <ProjectCard key={`${p.id}-${i}`} project={p} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.slug}`} className="group block w-[340px] shrink-0">
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-primary/10">
        <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-600/40 via-purple-600/30 to-fuchsia-600/40">
          {project.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.coverImage} alt={project.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
          ) : (
            <div className="bg-grid absolute inset-0 opacity-40" />
          )}
          <Badge variant="glass" className="absolute left-3 top-3">{project.domain}</Badge>
          {project.rating != null && project.rating > 0 && (
            <Badge variant="gradient" className="absolute right-3 top-3">
              <Star className="h-3 w-3 fill-current" /> {project.rating.toFixed(1)}
            </Badge>
          )}
        </div>
        <div className="p-5">
          <h3 className="line-clamp-1 font-display font-semibold group-hover:text-gradient">{project.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{project.abstract}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.techStack.slice(0, 3).map((t) => (
              <span key={t} className="rounded-full bg-muted/70 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                {t}
              </span>
            ))}
            {project.techStack.length > 3 && (
              <span className="rounded-full bg-muted/70 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                +{project.techStack.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
