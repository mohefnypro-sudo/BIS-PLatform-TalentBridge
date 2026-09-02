"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  CalendarDays,
  ExternalLink,
  FolderGit2,
  Github,
  GraduationCap,
  Star,
  Users,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, initials } from "@/lib/utils";

interface Member {
  id: string;
  roleInProject?: string | null;
  isLead: boolean;
  student: {
    id: string;
    user: { id: string; name: string; image?: string | null; email?: string | null };
    careerTrack?: { name: string; color?: string | null } | null;
  };
}

interface Project {
  id: string;
  title: string;
  slug: string;
  abstract: string;
  about?: string | null;
  domain: string;
  techStack: string[];
  academicYear?: string | null;
  imageGallery: string[];
  coverImage?: string | null;
  videoDemoUrl?: string | null;
  liveDemoUrl?: string | null;
  githubRepoUrl?: string | null;
  docsPdfUrl?: string | null;
  rating?: number | null;
  isFeatured: boolean;
  advisorName?: string | null;
  createdAt: string;
  members: Member[];
}

export default function ProjectShowcasePage() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/projects/slug/${slug}`);
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        setProject(await res.json());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <Skeleton className="h-80 w-full" />
        <div className="mt-8 space-y-3"><Skeleton className="h-8 w-2/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></div>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <FolderGit2 className="mx-auto h-14 w-14 text-muted-foreground/40" />
        <h1 className="mt-4 font-display text-2xl font-bold">Project not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This project may be awaiting approval or was removed.</p>
        <Button asChild className="mt-6"><Link href="/projects">Back to projects</Link></Button>
      </div>
    );
  }

  const lead = project.members.find((m) => m.isLead) ?? project.members[0];
  const links = [
    project.githubRepoUrl && { href: project.githubRepoUrl, label: "Source code", icon: Github },
    project.liveDemoUrl && { href: project.liveDemoUrl, label: "Live demo", icon: ExternalLink },
    project.videoDemoUrl && { href: project.videoDemoUrl, label: "Demo video", icon: Video },
    project.docsPdfUrl && { href: project.docsPdfUrl, label: "Documentation", icon: GraduationCap },
  ].filter(Boolean) as Array<{ href: string; label: string; icon: typeof Github }>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="mb-6 text-muted-foreground">
        <Link href="/projects"><ArrowLeft className="h-4 w-4" /> All projects</Link>
      </Button>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative overflow-hidden rounded-3xl border border-border/60">
        {project.coverImage ? (
          <img src={project.coverImage} alt={project.title} className="h-72 w-full object-cover sm:h-96" />
        ) : (
          <div className="bg-grid flex h-72 w-full items-center justify-center bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-fuchsia-600/20 sm:h-96">
            <FolderGit2 className="h-24 w-24 text-primary/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-white/90 text-foreground backdrop-blur">{project.domain}</Badge>
            <Badge variant="secondary" className="bg-white/70 backdrop-blur">{project.academicYear}</Badge>
            {project.isFeatured && <Badge className="bg-amber-400 text-amber-950">Featured</Badge>}
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold text-white drop-shadow sm:text-4xl">{project.title}</h1>
        </div>
      </motion.div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-8">
          <section>
            <h2 className="font-display text-lg font-bold">About</h2>
            <p className="mt-2 text-muted-foreground">{project.abstract}</p>
            {project.about && (
              <div className="mt-4 whitespace-pre-line text-muted-foreground">{project.about}</div>
            )}
          </section>

          {project.imageGallery.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-bold">Gallery</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {project.imageGallery.map((img, i) => (
                  <img key={i} src={img} alt={`${project.title} ${i + 1}`} className="aspect-video w-full rounded-2xl border border-border/60 object-cover transition-transform hover:scale-[1.02]" />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="font-display text-lg font-bold">Team</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {project.members.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-2xl border border-border/60 p-4">
                  <Avatar className="h-11 w-11">
                    {m.student.user.image ? <AvatarImage src={m.student.user.image} alt={m.student.user.name} /> : null}
                    <AvatarFallback>{initials(m.student.user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{m.student.user.name}</span>
                      {m.isLead && <Badge className="bg-amber-400/15 text-amber-600">Lead</Badge>}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {m.roleInProject || "Member"}
                      {m.student.careerTrack ? ` · ${m.student.careerTrack.name}` : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm">
            <h3 className="font-display font-bold">Details</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-muted-foreground"><FolderGit2 className="h-4 w-4" /> Domain</dt>
                <dd className="font-medium">{project.domain}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="h-4 w-4" /> Year</dt>
                <dd className="font-medium">{project.academicYear}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" /> Team size</dt>
                <dd className="font-medium">{project.members.length}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-muted-foreground"><Award className="h-4 w-4" /> Rating</dt>
                <dd className="flex items-center gap-1 font-medium">
                  <Star className={cn("h-4 w-4", (project.rating ?? 0) > 0 ? "fill-amber-400 text-amber-400" : "text-muted-foreground/50")} />
                  {project.rating ? project.rating.toFixed(1) : "Pending"}
                </dd>
              </div>
              {project.advisorName && (
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Advisor</dt>
                  <dd className="font-medium">{project.advisorName}</dd>
                </div>
              )}
            </dl>
          </div>

          {links.length > 0 && (
            <div className="space-y-2">
              {links.map((l) => (
                <Button key={l.label} asChild variant="outline" className="w-full justify-start">
                  <a href={l.href} target="_blank" rel="noreferrer">
                    <l.icon className="h-4 w-4" /> {l.label}
                  </a>
                </Button>
              ))}
            </div>
          )}

          {lead && (
            <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-indigo-600/5 to-fuchsia-600/5 p-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 ring-2 ring-primary/30">
                  {lead.student.user.image ? <AvatarImage src={lead.student.user.image} alt={lead.student.user.name} /> : null}
                  <AvatarFallback>{initials(lead.student.user.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{lead.student.user.name}</p>
                  <p className="text-xs text-muted-foreground">Team lead · {project.domain}</p>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </motion.div>
  );
}
