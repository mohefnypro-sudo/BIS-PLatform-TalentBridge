"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Award,
  Briefcase,
  CheckCircle2,
  FolderGit2,
  Github,
  Globe,
  GraduationCap,
  Linkedin,
  Star,
  Twitter,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, initials } from "@/lib/utils";
import { Navbar, Footer } from "@/components/layout/navbar";

interface Portfolio {
  id: string;
  level: string;
  tier: string;
  headline?: string | null;
  bio?: string | null;
  city?: string | null;
  graduationYear?: number | null;
  gpa?: number | null;
  github?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  website?: string | null;
  featuredSkills: string[];
  careerTrack?: { name: string; color?: string | null; skills: string[] } | null;
  user: { id: string; name: string; image?: string | null; bio?: string | null };
  certifications: Array<{ id: string; name: string; issuer: string; url?: string | null; issuedAt?: string | null }>;
  experiences: Array<{ id: string; title: string; company: string; startDate: string; endDate?: string | null; current: boolean; description?: string | null; skills: string[] }>;
  milestones: Array<{ id: string; title: string; status: string; progress: number; track: { name: string; color?: string | null } }>;
  projects: Array<{ id: string; project: { id: string; title: string; slug: string; abstract: string; domain: string; techStack: string[]; coverImage?: string | null } }>;
}

export default function PublicPortfolioPage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Portfolio | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/portfolios/${id}`);
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        setProfile(await res.json());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const socials = [
    profile?.github && { href: profile.github, icon: Github, label: "GitHub" },
    profile?.linkedin && { href: profile.linkedin, icon: Linkedin, label: "LinkedIn" },
    profile?.twitter && { href: profile.twitter, icon: Twitter, label: "Twitter" },
    profile?.website && { href: profile.website, icon: Globe, label: "Website" },
  ].filter(Boolean) as Array<{ href: string; icon: typeof Github; label: string }>;

  return (
    <>
      <Navbar />
      {loading ? (
        <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6">
          <div className="flex flex-wrap items-center gap-6">
            <Skeleton className="h-28 w-28 rounded-full" />
            <div className="flex-1 space-y-2"><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-96" /></div>
          </div>
          <Skeleton className="mt-10 h-40 w-full" />
        </div>
      ) : notFound || !profile ? (
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <User className="mx-auto h-14 w-14 text-muted-foreground/40" />
          <h1 className="mt-4 font-display text-2xl font-bold">Portfolio not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">This student's portfolio is private or does not exist.</p>
          <Button asChild className="mt-6"><Link href="/">Back home</Link></Button>
        </div>
      ) : (
        <main className="mx-auto max-w-5xl px-4 pb-20 pt-16 sm:px-6">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-fuchsia-600/10 p-8">
              <div className="bg-grid absolute inset-0 opacity-20" />
              <div className="relative flex flex-wrap items-center gap-6">
                <Avatar className="h-28 w-28 ring-4 ring-primary/20">
                  {profile.user.image ? <AvatarImage src={profile.user.image} alt={profile.user.name} /> : null}
                  <AvatarFallback className="text-3xl">{initials(profile.user.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h1 className="font-display text-3xl font-bold">{profile.user.name}</h1>
                  <p className="mt-1 text-muted-foreground">{profile.headline || profile.user.bio}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{profile.level.toLowerCase().replaceAll("_", " ")}</Badge>
                    <Badge className="bg-gradient-to-r from-indigo-600/15 to-fuchsia-600/15 text-foreground">{profile.tier} tier</Badge>
                    {profile.careerTrack && <Badge variant="outline">{profile.careerTrack.name}</Badge>}
                    {profile.city && <span className="text-sm text-muted-foreground">· {profile.city}</span>}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  {socials.map((s) => (
                    <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                      <s.icon className="h-4 w-4" /> {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_300px]">
            <div className="min-w-0 space-y-10">
              {profile.bio && (
                <section>
                  <h2 className="flex items-center gap-2 font-display text-lg font-bold"><User className="h-4 w-4 text-primary" /> About</h2>
                  <p className="mt-2 text-muted-foreground">{profile.bio}</p>
                </section>
              )}

              {profile.featuredSkills.length > 0 && (
                <section>
                  <h2 className="flex items-center gap-2 font-display text-lg font-bold"><Star className="h-4 w-4 text-primary" /> Skills</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {profile.featuredSkills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
                  </div>
                </section>
              )}

              {profile.projects.length > 0 && (
                <section>
                  <h2 className="flex items-center gap-2 font-display text-lg font-bold"><FolderGit2 className="h-4 w-4 text-primary" /> Graduation Projects</h2>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    {profile.projects.map(({ project }) => (
                      <Link key={project.id} href={`/projects/${project.slug}`} className="group">
                        <div className="overflow-hidden rounded-2xl border border-border/60 transition-all hover:border-primary/40 hover:shadow-lg">
                          {project.coverImage ? (
                            <div className="h-32 overflow-hidden">
                              <img src={project.coverImage} alt={project.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            </div>
                          ) : (
                            <div className="flex h-32 items-center justify-center bg-gradient-to-br from-indigo-600/10 to-fuchsia-600/10">
                              <FolderGit2 className="h-8 w-8 text-primary/40" />
                            </div>
                          )}
                          <div className="p-4">
                            <h3 className="font-medium group-hover:text-primary">{project.title}</h3>
                            <p className="mt-1 text-xs text-muted-foreground">{project.domain} · {project.techStack.slice(0, 3).join(", ")}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {profile.experiences.length > 0 && (
                <section>
                  <h2 className="flex items-center gap-2 font-display text-lg font-bold"><Briefcase className="h-4 w-4 text-primary" /> Experience</h2>
                  <div className="mt-3 space-y-3">
                    {profile.experiences.map((exp) => (
                      <div key={exp.id} className="rounded-2xl border border-border/60 p-4">
                        <div className="font-medium">{exp.title} <span className="text-muted-foreground">@ {exp.company}</span></div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(exp.startDate).toLocaleDateString()} – {exp.current ? "Present" : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : "—"}
                        </div>
                        {exp.description && <p className="mt-2 text-sm text-muted-foreground">{exp.description}</p>}
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {exp.skills.map((s) => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {profile.certifications.length > 0 && (
                <section>
                  <h2 className="flex items-center gap-2 font-display text-lg font-bold"><Award className="h-4 w-4 text-primary" /> Certifications</h2>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {profile.certifications.map((c) => (
                      <div key={c.id} className="rounded-2xl border border-border/60 p-4">
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.issuer}{c.issuedAt ? ` · ${new Date(c.issuedAt).toLocaleDateString()}` : ""}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-3xl border border-border/60 bg-card/60 p-6">
                <h3 className="font-display font-bold">Roadmap</h3>
                <div className="mt-4 space-y-3">
                  {profile.milestones.length === 0 && <p className="text-sm text-muted-foreground">Building their roadmap...</p>}
                  {profile.milestones.map((m) => (
                    <div key={m.id} className="flex items-start gap-2.5">
                      <CheckCircle2 className={cn("mt-0.5 h-4 w-4 shrink-0", m.status === "COMPLETED" ? "text-emerald-500" : "text-amber-500")} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{m.title}</p>
                        <p className="text-xs text-muted-foreground">{m.track.name} · {m.progress}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-indigo-600/5 to-fuchsia-600/5 p-6 text-center">
                <GraduationCap className="mx-auto h-8 w-8 text-primary" />
                <p className="mt-2 text-sm text-muted-foreground">Graduating {profile.graduationYear ?? "—"}{profile.gpa ? ` · GPA ${profile.gpa.toFixed(2)}` : ""}</p>
                <Button asChild className="mt-4 w-full"><Link href="/jobs">Offer them a role</Link></Button>
              </div>
            </aside>
          </div>
        </main>
      )}
      <Footer />
    </>
  );
}
