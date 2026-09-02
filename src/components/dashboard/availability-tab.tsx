"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarPlus, CalendarX2, Clock, Loader2, Save, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { SESSION_LENGTHS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ar } from "@/lib/i18n";

interface Slot {
  id: string;
  startsAt: string;
  endsAt: string;
  isBooked: boolean;
  booking?: { id: string } | null;
}

interface MentorSettings {
  id: string;
  headline?: string | null;
  bio?: string | null;
  domains: string[];
  yearsOfExperience?: number | null;
  isFree: boolean;
  hourlyRate?: number | null;
  sessionLengths: number[];
  videoLinkPreference?: string | null;
  maxBookingsPerDay?: number | null;
}

export function AvailabilityTab({ refreshKey }: { refreshKey: number }) {
  const { toast } = useToast();
  const [mentorId, setMentorId] = useState<string | null>(null);
  const [settings, setSettings] = useState<MentorSettings | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [form, setForm] = useState({
    headline: "",
    bio: "",
    yearsOfExperience: "",
    hourlyRate: "",
    maxBookingsPerDay: "",
    domains: "",
  });
  const [isFree, setIsFree] = useState(false);
  const [sessionLengths, setSessionLengths] = useState<number[]>([30]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const me = await fetch("/api/me").then((r) => r.json());
      const profileId = me?.mentorProfile?.id;
      if (!profileId) return;
      setMentorId(profileId);

      const [profileRes, slotsRes] = await Promise.all([
        fetch("/api/mentors/me").then((r) => r.json()),
        fetch(`/api/mentors/${profileId}/slots`).then((r) => r.json()).catch(() => []),
      ]);
      setSettings(profileRes);
      setIsFree(profileRes.isFree ?? false);
      setSessionLengths(profileRes.sessionLengths?.length ? profileRes.sessionLengths : [30]);
      setForm({
        headline: profileRes.headline ?? "",
        bio: profileRes.bio ?? "",
        yearsOfExperience: profileRes.yearsOfExperience != null ? String(profileRes.yearsOfExperience) : "",
        hourlyRate: profileRes.hourlyRate != null ? String(profileRes.hourlyRate) : "",
        maxBookingsPerDay: profileRes.maxBookingsPerDay != null ? String(profileRes.maxBookingsPerDay) : "",
        domains: (profileRes.domains ?? []).join(", "),
      });
      setSlots(Array.isArray(slotsRes) ? slotsRes : slotsRes.slots ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/mentors/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: form.headline,
          bio: form.bio,
          domains: form.domains.split(",").map((d) => d.trim()).filter(Boolean).slice(0, 12),
          yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : undefined,
          hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : null,
          maxBookingsPerDay: form.maxBookingsPerDay ? Number(form.maxBookingsPerDay) : undefined,
          isFree,
          sessionLengths,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to save");
      toast({ variant: "success", title: ar.common.success, description: "Mentor settings updated." });
    } catch (err) {
      toast({ variant: "destructive", title: ar.common.error, description: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  async function createSlot(e: React.FormEvent) {
    e.preventDefault();
    if (!startDate) {
      toast({ variant: "destructive", title: "Pick a date", description: "Choose a day for your slot." });
      return;
    }
    setCreating(true);
    try {
      const startsAt = new Date(`${startDate}T${startTime}`);
      const endsAt = new Date(`${startDate}T${endTime}`);
      const res = await fetch("/api/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startsAt, endsAt }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to create slot");
      toast({ variant: "success", title: "Slot created", description: "Students can now book this time." });
      load();
    } catch (err) {
      toast({ variant: "destructive", title: ar.common.error, description: (err as Error).message });
    } finally {
      setCreating(false);
    }
  }

  async function deleteSlot(id: string) {
    const res = await fetch(`/api/slots/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast({ variant: "destructive", title: "Cannot delete", description: data.error ?? ar.common.error });
      return;
    }
    toast({ title: ar.availability.remove });
    load();
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-bold">{ar.availability.title}</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{ar.availability.subtitle}</p>
      </div>

      <form onSubmit={saveSettings}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings2 className="h-4 w-4 text-primary" /> {ar.availability.mentorPreferences}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>{ar.availability.headline}</Label>
              <Input value={form.headline} onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))} placeholder={ar.availability.headlinePlaceholder} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{ar.availability.bio}</Label>
              <Input value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} placeholder={ar.availability.bioPlaceholder} />
            </div>
            <div className="space-y-2">
              <Label>{ar.availability.domains}</Label>
              <Input value={form.domains} onChange={(e) => setForm((f) => ({ ...f, domains: e.target.value }))} placeholder={ar.availability.domainsPlaceholder} />
            </div>
            <div className="space-y-2">
              <Label>{ar.availability.yearsExp}</Label>
              <Input type="number" min="0" max="60" value={form.yearsOfExperience} onChange={(e) => setForm((f) => ({ ...f, yearsOfExperience: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{ar.availability.maxBookings}</Label>
              <Input type="number" min="1" max="20" value={form.maxBookingsPerDay} onChange={(e) => setForm((f) => ({ ...f, maxBookingsPerDay: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{ar.availability.sessionLengths}</Label>
              <Select
                value={String(sessionLengths[0] ?? 30)}
                onValueChange={(v) => setSessionLengths([Number(v)])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SESSION_LENGTHS.map((l) => <SelectItem key={l} value={String(l)}>{l} دقيقة</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 p-4 sm:col-span-2">
              <div>
                <Label>{ar.availability.freeMentoring}</Label>
                <p className="text-xs text-muted-foreground">{ar.availability.freeMentoringDesc}</p>
              </div>
              <Switch checked={isFree} onCheckedChange={setIsFree} />
            </div>
            {!isFree && (
              <div className="space-y-2">
                <Label>{ar.availability.hourlyRate}</Label>
                <Input type="number" min="0" max="5000" value={form.hourlyRate} onChange={(e) => setForm((f) => ({ ...f, hourlyRate: e.target.value }))} placeholder="50" />
              </div>
            )}
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {ar.availability.savePreferences}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <form onSubmit={createSlot}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarPlus className="h-4 w-4 text-primary" /> {ar.availability.openSlot}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <Label>{ar.availability.date}</Label>
              <Input type="date" required min={new Date().toISOString().split("T")[0]} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{ar.availability.start}</Label>
              <Input type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{ar.availability.end}</Label>
              <Input type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
                {ar.availability.addSlot}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display font-semibold">{ar.availability.yourSlots}</h3>
          <Badge variant="secondary">{slots.length} {ar.public.members}</Badge>
        </div>
        {slots.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 p-10 text-center">
            <CalendarX2 className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">{ar.availability.noSlots}</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {slots
              .filter((s) => new Date(s.endsAt) > new Date())
              .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
              .map((s) => (
                <div key={s.id} className={cn("rounded-2xl border p-4", s.isBooked ? "border-indigo-500/40 bg-indigo-500/5" : "border-border/60")}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {new Date(s.startsAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                    <Badge variant={s.isBooked ? "default" : "outline"} className={s.isBooked ? "bg-indigo-500/20 text-indigo-600" : ""}>
                      {s.isBooked ? ar.availability.booked : ar.availability.open}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(s.startsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
                    {new Date(s.endsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <Button size="sm" variant="ghost" className="mt-2 text-destructive hover:text-destructive" disabled={s.isBooked} onClick={() => deleteSlot(s.id)}>
                    <CalendarX2 className="h-4 w-4" /> {ar.availability.remove}
                  </Button>
                </div>
              ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
