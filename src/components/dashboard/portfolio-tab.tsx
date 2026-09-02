"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  Briefcase,
  Github,
  Globe,
  GraduationCap,
  Linkedin,
  Loader2,
  Plus,
  Save,
  Trash2,
  Twitter,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ACADEMIC_LEVELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ar } from "@/lib/i18n";

interface Profile {
  id: string;
  level: string;
  headline?: string | null;
  bio?: string | null;
  city?: string | null;
  graduationYear?: number | null;
  gpa?: number | null;
  resumeUrl?: string | null;
  resumeName?: string | null;
  website?: string | null;
  github?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  preferredTags: string[];
  featuredSkills: string[];
  showcase: boolean;
  careerTrackId?: string | null;
  careerTrack?: { id: string; name: string; color?: string | null } | null;
  certifications: Certification[];
  experiences: Experience[];
  user: { id: string; name: string; email: string; image?: string | null; bio?: string | null; phone?: string | null };
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  url?: string | null;
  issuedAt?: string | null;
  verifyId?: string | null;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  companyLogo?: string | null;
  startDate: string;
  endDate?: string | null;
  current: boolean;
  description?: string | null;
  skills: string[];
}

interface Track {
  id: string;
  name: string;
  slug: string;
  color?: string | null;
}

export function PortfolioTab({
  refreshKey,
  onDataChange,
  settingsMode = false,
}: {
  refreshKey: number;
  onDataChange: () => void;
  settingsMode?: boolean;
}) {
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [level, setLevel] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [showcase, setShowcase] = useState(false);
  const [certDialog, setCertDialog] = useState(false);
  const [expDialog, setExpDialog] = useState(false);
  const [certForm, setCertForm] = useState({ name: "", issuer: "", url: "", issuedAt: "", verifyId: "" });
  const [expForm, setExpForm] = useState({
    title: "",
    company: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
    skills: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, tracksRes] = await Promise.all([
        fetch("/api/students/me").then((r) => r.json()),
        fetch("/api/tracks").then((r) => r.json()),
      ]);
      setProfile(profileRes);
      setTracks(tracksRes);
      setShowcase(profileRes.showcase ?? false);
      setSkills(profileRes.featuredSkills ?? []);
      setLevel(profileRes.level ?? "FRESHMAN");
      setForm({
        name: profileRes.user?.name ?? "",
        headline: profileRes.headline ?? "",
        bio: profileRes.bio ?? "",
        city: profileRes.city ?? "",
        gpa: profileRes.gpa != null ? String(profileRes.gpa) : "",
        graduationYear: profileRes.graduationYear != null ? String(profileRes.graduationYear) : "",
        website: profileRes.website ?? "",
        github: profileRes.github ?? "",
        linkedin: profileRes.linkedin ?? "",
        twitter: profileRes.twitter ?? "",
        resumeUrl: profileRes.resumeUrl ?? "",
        phone: profileRes.user?.phone ?? "",
        image: profileRes.user?.image ?? "",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, phone: form.phone || null, image: form.image || null }),
      });

      const body: Record<string, unknown> = { ...form, featuredSkills: skills, showcase, level };
      delete body.name;
      delete body.phone;
      delete body.image;
      if (form.gpa !== "") body.gpa = Number(form.gpa);
      if (form.graduationYear !== "") body.graduationYear = Number(form.graduationYear);
      if (profile?.careerTrackId) body.careerTrackId = profile.careerTrackId;
      const res = await fetch("/api/students/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to save");
      toast({ variant: "success", title: ar.common.success, description: "تم تحديث ملفك الشخصي بنجاح." });
      onDataChange();
    } catch (e) {
      toast({ variant: "destructive", title: ar.common.error, description: (e as Error).message });
    } finally {
      setSaving(false);
    }
  }

  async function createCertification(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/certifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...certForm, issuedAt: certForm.issuedAt ? new Date(certForm.issuedAt) : undefined }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      setCertDialog(false);
      setCertForm({ name: "", issuer: "", url: "", issuedAt: "", verifyId: "" });
      load();
    } catch (e) {
      toast({ variant: "destructive", title: ar.common.error, description: (e as Error).message });
    }
  }

  async function deleteCertification(id: string) {
    await fetch(`/api/certifications/${id}`, { method: "DELETE" });
    load();
  }

  async function createExperience(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...expForm,
          skills: expForm.skills.split(",").map((s) => s.trim()).filter(Boolean),
          startDate: new Date(expForm.startDate),
          endDate: expForm.endDate ? new Date(expForm.endDate) : null,
          current: expForm.current,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      setExpDialog(false);
      setExpForm({ title: "", company: "", startDate: "", endDate: "", current: false, description: "", skills: "" });
      load();
    } catch (e) {
      toast({ variant: "destructive", title: ar.common.error, description: (e as Error).message });
    }
  }

  async function deleteExperience(id: string) {
    await fetch(`/api/experiences/${id}`, { method: "DELETE" });
    load();
  }

  function addSkill() {
    const s = skillInput.trim();
    if (!s || skills.includes(s)) return;
    setSkills((prev) => [...prev, s].slice(0, 30));
    setSkillInput("");
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <form onSubmit={saveProfile} className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> {settingsMode ? ar.dashboard.settings : ar.dashboard.portfolio}
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{ar.overview.portfolioPublic}</span>
                <Switch checked={showcase} onCheckedChange={setShowcase} />
              </div>
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {ar.common.save}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{ar.register.fullName}</Label>
              <Input value={form.name ?? ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{ar.login.email}</Label>
              <Input value={profile?.user.email ?? ""} disabled className="opacity-60" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>رابط الصورة الشخصية</Label>
              <Input placeholder="https://..." value={form.image ?? ""} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{ar.public.portfolioOf}</Label>
              <Input placeholder="+20 1XX XXX XXXX" value={form.phone ?? ""} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{ar.public.domain}</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACADEMIC_LEVELS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{ar.recruiter.careerTrack}</Label>
              <Select
                value={profile?.careerTrackId ?? ""}
                onValueChange={(v) => setProfile((p) => (p ? { ...p, careerTrackId: v } : p))}
              >
                <SelectTrigger><SelectValue placeholder={ar.growth.selectTrack} /></SelectTrigger>
                <SelectContent>
                  {tracks.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{ar.availability.headline}</Label>
              <Input placeholder={ar.availability.headlinePlaceholder} value={form.headline ?? ""} onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{ar.public.aboutMe}</Label>
              <Textarea rows={4} placeholder={ar.public.aboutMe} value={form.bio ?? ""} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{ar.recruiter.cityLocation}</Label>
              <Input placeholder="Cairo" value={form.city ?? ""} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{ar.overview.avgRating}</Label>
                <Input type="number" step="0.1" min="0" max="4" placeholder="3.5" value={form.gpa ?? ""} onChange={(e) => setForm((f) => ({ ...f, gpa: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{ar.public.year}</Label>
                <Input type="number" min="2015" max="2040" placeholder="2026" value={form.graduationYear ?? ""} onChange={(e) => setForm((f) => ({ ...f, graduationYear: e.target.value }))} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary" /> {ar.public.skills}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <Badge key={s} variant="secondary" className="gap-1 pl-3">
                  {s}
                  <button onClick={() => setSkills((prev) => prev.filter((x) => x !== s))} className="text-muted-foreground hover:text-destructive" aria-label={`Remove ${s}`}>×</button>
                </Badge>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Input
                placeholder={ar.public.skills}
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
              />
              <Button type="button" variant="outline" onClick={addSkill}><Plus className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> {ar.public.documentation}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Globe className="h-3.5 w-3.5" /> {ar.public.sourceCode}</Label>
              <Input placeholder="https://..." value={form.website ?? ""} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Github className="h-3.5 w-3.5" /> GitHub</Label>
              <Input placeholder="https://github.com/..." value={form.github ?? ""} onChange={(e) => setForm((f) => ({ ...f, github: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Linkedin className="h-3.5 w-3.5" /> LinkedIn</Label>
              <Input placeholder="https://linkedin.com/in/..." value={form.linkedin ?? ""} onChange={(e) => setForm((f) => ({ ...f, linkedin: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Twitter className="h-3.5 w-3.5" /> Twitter / X</Label>
              <Input placeholder="https://x.com/..." value={form.twitter ?? ""} onChange={(e) => setForm((f) => ({ ...f, twitter: e.target.value }))} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{ar.public.resumeUrl}</Label>
              <Input placeholder="https://drive.google.com/..." value={form.resumeUrl ?? ""} onChange={(e) => setForm((f) => ({ ...f, resumeUrl: e.target.value }))} />
            </div>
          </CardContent>
        </Card>
      </form>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" /> {ar.public.experience}</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setExpDialog(true)}><Plus className="h-4 w-4" /> {ar.common.add}</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile?.experiences.length === 0 && <p className="text-sm text-muted-foreground">{ar.public.noExperience}</p>}
          {profile?.experiences.map((exp) => (
            <div key={exp.id} className="flex items-start justify-between gap-4 rounded-xl border border-border/60 p-4">
              <div>
                <div className="font-medium">{exp.title} <span className="text-muted-foreground">@ {exp.company}</span></div>
                <div className="text-xs text-muted-foreground">
                  {new Date(exp.startDate).toLocaleDateString()} – {exp.current ? ar.common.present : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : "—"}
                </div>
                {exp.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{exp.description}</p>}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {exp.skills.map((s) => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteExperience(exp.id)}><Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Award className="h-4 w-4 text-primary" /> {ar.public.certifications}</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setCertDialog(true)}><Plus className="h-4 w-4" /> {ar.common.add}</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile?.certifications.length === 0 && <p className="text-sm text-muted-foreground">{ar.public.noCertifications}</p>}
          {profile?.certifications.map((cert) => (
            <div key={cert.id} className="flex items-center justify-between gap-4 rounded-xl border border-border/60 p-4">
              <div>
                <div className="font-medium">{cert.name}</div>
                <div className="text-xs text-muted-foreground">{cert.issuer}{cert.issuedAt ? ` · ${new Date(cert.issuedAt).toLocaleDateString()}` : ""}</div>
                {cert.url && <a href={cert.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">{ar.recruiter.review}</a>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteCertification(cert.id)}><Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={expDialog} onOpenChange={setExpDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{ar.common.add} {ar.public.experience}</DialogTitle></DialogHeader>
          <form onSubmit={createExperience} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>{ar.public.teamLead}</Label><Input required value={expForm.title} onChange={(e) => setExpForm((f) => ({ ...f, title: e.target.value }))} /></div>
              <div className="space-y-2"><Label>{ar.recruiter.company}</Label><Input required value={expForm.company} onChange={(e) => setExpForm((f) => ({ ...f, company: e.target.value }))} /></div>
              <div className="space-y-2"><Label>{ar.availability.start}</Label><Input required type="date" value={expForm.startDate} onChange={(e) => setExpForm((f) => ({ ...f, startDate: e.target.value }))} /></div>
              <div className="space-y-2">
                <Label>{ar.availability.end}</Label>
                <Input type="date" value={expForm.endDate} disabled={expForm.current} onChange={(e) => setExpForm((f) => ({ ...f, endDate: e.target.value }))} />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Switch checked={expForm.current} onCheckedChange={(v) => setExpForm((f) => ({ ...f, current: v }))} />
              <span className="text-muted-foreground">{ar.common.present}</span>
            </div>
            <div className="space-y-2"><Label>{ar.recruiter.skills}</Label><Input value={expForm.skills} onChange={(e) => setExpForm((f) => ({ ...f, skills: e.target.value }))} /></div>
            <div className="space-y-2"><Label>{ar.recruiter.description}</Label><Textarea value={expForm.description} onChange={(e) => setExpForm((f) => ({ ...f, description: e.target.value }))} /></div>
            <Button type="submit" className={cn("w-full")}><Plus className="h-4 w-4" /> {ar.common.add} {ar.public.experience}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={certDialog} onOpenChange={setCertDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{ar.common.add} {ar.public.certifications}</DialogTitle></DialogHeader>
          <form onSubmit={createCertification} className="space-y-4">
            <div className="space-y-2"><Label>{ar.public.teamLead}</Label><Input required placeholder="e.g. AWS Cloud Practitioner" value={certForm.name} onChange={(e) => setCertForm((f) => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>{ar.public.advisor}</Label><Input required placeholder="e.g. Amazon" value={certForm.issuer} onChange={(e) => setCertForm((f) => ({ ...f, issuer: e.target.value }))} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>{ar.availability.date}</Label><Input type="date" value={certForm.issuedAt} onChange={(e) => setCertForm((f) => ({ ...f, issuedAt: e.target.value }))} /></div>
              <div className="space-y-2"><Label>{ar.public.rating}</Label><Input value={certForm.verifyId} onChange={(e) => setCertForm((f) => ({ ...f, verifyId: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>{ar.public.liveDemo}</Label><Input placeholder="https://..." value={certForm.url} onChange={(e) => setCertForm((f) => ({ ...f, url: e.target.value }))} /></div>
            <Button type="submit" className="w-full"><Plus className="h-4 w-4" /> {ar.common.add} {ar.public.certifications}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
