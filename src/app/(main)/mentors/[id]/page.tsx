"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  CalendarClock,
  Check,
  Clock,
  Loader2,
  MessageSquareQuote,
  ShieldCheck,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/input";
import { cn, initials } from "@/lib/utils";
import { SESSION_TYPES } from "@/lib/constants";

interface Mentor {
  id: string;
  headline?: string | null;
  bio?: string | null;
  domains: string[];
  yearsOfExperience: number;
  isFree: boolean;
  hourlyRate?: number | null;
  sessionLengths: number[];
  avgRating: number;
  totalSessions: number;
  isVerified: boolean;
  user: { id: string; name: string; image?: string | null; bio?: string | null; phone?: string | null };
  slots: Slot[];
}

interface Slot {
  id: string;
  startsAt: string;
  endsAt: string;
  isBooked: boolean;
}

export default function MentorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [sessionType, setSessionType] = useState("CAREER_GUIDANCE");
  const [sessionLength, setSessionLength] = useState(30);
  const [questions, setQuestions] = useState("");
  const [notes, setNotes] = useState("");
  const [booking, setBooking] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/mentors/${id}`);
      if (!res.ok) {
        setNotFound(true);
        return;
      }
      setMentor(await res.json());
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function confirmBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!mentor || !selectedSlot) return;
    setBooking(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorProfileId: mentor.id,
          startsAt: selectedSlot.startsAt,
          endsAt: selectedSlot.endsAt,
          sessionType,
          sessionLength,
          preSessionQuestions: questions,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?callbackUrl=/mentors/${id}`);
          return;
        }
        throw new Error(data.error ?? "Booking failed");
      }
      toast({ variant: "success", title: "Request sent 🎉", description: "The mentor will confirm your session shortly." });
      setSelectedSlot(null);
      load();
    } catch (err) {
      toast({ variant: "destructive", title: "Could not book", description: (err as Error).message });
    } finally {
      setBooking(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <Skeleton className="h-40 w-full" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (notFound || !mentor) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <Compass className="mx-auto h-14 w-14 text-muted-foreground/40" />
        <h1 className="mt-4 font-display text-2xl font-bold">Mentor not found</h1>
        <Button asChild className="mt-6"><a href="/mentors">Back to mentors</a></Button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="mb-6 text-muted-foreground">
        <a href="/mentors"><ArrowLeft className="h-4 w-4" /> All mentors</a>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-fuchsia-600/10 p-8"
          >
            <div className="bg-grid absolute inset-0 opacity-20" />
            <div className="relative flex flex-wrap items-center gap-6">
              <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                {mentor.user.image ? <AvatarImage src={mentor.user.image} alt={mentor.user.name} /> : null}
                <AvatarFallback className="text-2xl">{initials(mentor.user.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-3xl font-bold">{mentor.user.name}</h1>
                  {mentor.isVerified && (
                    <Badge className="gap-1 bg-indigo-500/15 text-indigo-600">
                      <BadgeCheck className="h-3.5 w-3.5" /> Verified
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-muted-foreground">{mentor.headline || mentor.user.bio}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Star className={cn("h-4 w-4", mentor.avgRating > 0 ? "fill-amber-400 text-amber-400" : "text-muted-foreground/50")} />
                    {mentor.avgRating > 0 ? mentor.avgRating.toFixed(1) : "New mentor"}
                  </span>
                  <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {mentor.totalSessions} sessions</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {mentor.yearsOfExperience}+ years</span>
                  <span className="flex items-center gap-1.5">
                    <Wallet className="h-4 w-4" />
                    {mentor.isFree ? "Free" : mentor.hourlyRate ? `$${mentor.hourlyRate}/hr` : "Paid"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <section>
            <h2 className="font-display text-lg font-bold">About</h2>
            <p className="mt-2 whitespace-pre-line text-muted-foreground">
              {mentor.bio || mentor.user.bio || "This mentor is excited to guide students."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {mentor.domains.map((d) => (
                <Badge key={d} variant="secondary">{d}</Badge>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold">What you get</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                { icon: MessageSquareQuote, title: "Personalized guidance", text: "Tailored advice on your projects, career path and goals." },
                { icon: CalendarClock, title: `${mentor.sessionLengths.map((l) => l).join(" · ")} min sessions`, text: "Flexible session lengths that fit your schedule." },
                { icon: ShieldCheck, title: "Safe & tracked", text: "Every session is tracked with reviews and follow-ups." },
                { icon: Award, title: "Real experience", text: `Learn from a ${mentor.yearsOfExperience}+ year industry professional.` },
              ].map((f) => (
                <div key={f.title} className="rounded-2xl border border-border/60 p-5">
                  <f.icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-3 font-medium">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm"
          >
            <h3 className="flex items-center gap-2 font-display font-bold">
              <CalendarClock className="h-4 w-4 text-primary" /> Book a session
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">Pick an open slot to request a session.</p>

            {mentor.slots.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-border/70 p-8 text-center">
                <CalendarClock className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No open slots right now. Check back soon!</p>
              </div>
            ) : (
              <>
                <div className="mt-4 grid max-h-72 gap-2 overflow-y-auto pr-1">
                  {mentor.slots.map((s) => {
                    const active = selectedSlot?.id === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSlot(active ? null : s)}
                        className={cn(
                          "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all",
                          active
                            ? "border-primary/50 bg-gradient-to-r from-indigo-600/15 to-fuchsia-600/15 ring-1 ring-primary/30"
                            : "border-border/60 hover:border-primary/30",
                        )}
                      >
                        <div>
                          <div className="text-sm font-medium">
                            {new Date(s.startsAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(s.startsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
                            {new Date(s.endsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                        {active && <Check className="h-4 w-4 text-primary" />}
                      </button>
                    );
                  })}
                </div>

                <form onSubmit={confirmBooking} className="mt-5 space-y-4">
                  <div className="space-y-2">
                    <Label>Session type</Label>
                    <select
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      value={sessionType}
                      onChange={(e) => setSessionType(e.target.value)}
                    >
                      {SESSION_TYPES.map((t) => (
                        <option key={t} value={t}>{t.toLowerCase().replaceAll("_", " ")}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Length</Label>
                    <div className="flex flex-wrap gap-2">
                      {mentor.sessionLengths.map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setSessionLength(l)}
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-sm font-medium transition-all",
                            sessionLength === l
                              ? "border-primary/50 bg-primary/10 text-foreground"
                              : "border-border/60 text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {l}m
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Questions for the mentor (optional)</Label>
                    <Textarea rows={2} placeholder="What would you like to discuss?" value={questions} onChange={(e) => setQuestions(e.target.value)} />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!selectedSlot || booking}
                  >
                    {booking ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />}
                    {selectedSlot ? "Request this session" : "Select a slot first"}
                  </Button>
                </form>
              </>
            )}
          </motion.div>
        </aside>
      </div>
    </motion.div>
  );
}

function Compass({ className }: { className?: string }) {
  return (
    <svg className={cn(className, "text-muted-foreground/40")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
