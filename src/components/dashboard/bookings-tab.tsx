"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Loader2, MessageSquareQuote, Star, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, initials, formatDate } from "@/lib/utils";
import { ar } from "@/lib/i18n";

interface Booking {
  id: string;
  status: string;
  sessionType: string;
  sessionLength: number;
  scheduledFor: string;
  endsAt: string;
  meetingLink?: string | null;
  mentorNotes?: string | null;
  studentFeedback?: string | null;
  studentRating?: number | null;
  preSessionQuestions?: string | null;
  notes?: string | null;
  student: { id: string; user: { id: string; name: string; image?: string | null; email?: string | null } };
  mentor: { id: string; user: { id: string; name: string; image?: string | null } };
}

export function BookingsTab({
  role,
  refreshKey,
  onDataChange,
}: {
  role: string;
  refreshKey: number;
  onDataChange: () => void;
}) {
  const { toast } = useToast();
  const [tab, setTab] = useState<"upcoming" | "past" | "requests">("upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [meetingDialog, setMeetingDialog] = useState<Booking | null>(null);
  const [feedbackDialog, setFeedbackDialog] = useState<Booking | null>(null);
  const [meetingLink, setMeetingLink] = useState("");
  const [mentorNotes, setMentorNotes] = useState("");
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings?tab=${tab}`);
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load, refreshKey, tab]);

  async function updateStatus(booking: Booking, status: string, extra: Record<string, unknown> = {}) {
    setActing(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...extra }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      toast({ variant: "success", title: ar.common.success, description: `Booking ${status.toLowerCase().replace("_", " ")}.` });
      setMeetingDialog(null);
      setFeedbackDialog(null);
      onDataChange();
      load();
    } catch (e) {
      toast({ variant: "destructive", title: ar.common.error, description: (e as Error).message });
    } finally {
      setActing(false);
    }
  }

  const isMentor = role === "MENTOR";
  const visibleTabs: Array<"upcoming" | "past" | "requests"> = isMentor ? ["requests", "upcoming", "past"] : ["upcoming", "past"];

  const statusStyles: Record<string, string> = {
    PENDING: "bg-amber-500/15 text-amber-600",
    APPROVED: "bg-emerald-500/15 text-emerald-600",
    COMPLETED: "bg-indigo-500/15 text-indigo-600",
    CANCELLED: "bg-red-500/15 text-red-600",
    DECLINED: "bg-red-500/15 text-red-600",
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold">{isMentor ? ar.bookings.mentoringSessions : ar.bookings.mySessions}</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {isMentor ? ar.bookings.mentorDesc : ar.bookings.studentDesc}
          </p>
        </div>
      </div>

      <div className="inline-flex rounded-xl border border-border/60 bg-card/60 p-1">
        {visibleTabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-all",
              tab === t ? "bg-gradient-to-r from-indigo-600/15 to-fuchsia-600/15 text-foreground ring-1 ring-primary/30" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t === "upcoming" ? ar.bookings.upcoming : t === "past" ? ar.bookings.past : ar.bookings.requests}
          </button>
        ))}
      </div>

      {bookings.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center">
          <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">{ar.bookings.noSessions.replace("{tab}", tab === "upcoming" ? ar.bookings.upcoming : tab === "past" ? ar.bookings.past : ar.bookings.requests)}</p>
        </div>
      )}

      <div className="space-y-4">
        {bookings.map((b) => {
          const other = isMentor ? b.student.user : b.mentor.user;
          return (
            <Card key={b.id} className="p-0">
              <CardContent className="flex flex-wrap items-center gap-4 p-5">
                <Avatar className="h-12 w-12 shrink-0">
                  {other.image ? <AvatarImage src={other.image} alt={other.name} /> : null}
                  <AvatarFallback>{initials(other.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{other.name}</span>
                    <Badge className={cn("", statusStyles[b.status] ?? "")}>{b.status.toLowerCase().replace("_", " ")}</Badge>
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{formatDate(b.scheduledFor)}</span>
                    <span>{b.sessionLength} min</span>
                    <span>{b.sessionType.toLowerCase().replaceAll("_", " ")}</span>
                  </div>
                  {b.preSessionQuestions && (
                    <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                      <MessageSquareQuote className="mt-0.5 h-3 w-3 shrink-0" /> {b.preSessionQuestions}
                    </p>
                  )}
                  {b.meetingLink && (
                    <a href={b.meetingLink} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                      <Video className="h-3 w-3" /> {ar.bookings.joinMeeting}
                    </a>
                  )}
                  {b.mentorNotes && <p className="mt-1 text-xs text-muted-foreground">{ar.bookings.mentorNotes} {b.mentorNotes}</p>}
                  {b.studentRating != null && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-amber-500">
                      {[...Array(5)].map((_, i) => <Star key={i} className={cn("h-3 w-3", i < b.studentRating! ? "fill-current" : "text-muted-foreground/30")} />)}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {isMentor && b.status === "PENDING" && (
                    <>
                      <Button size="sm" disabled={acting} onClick={() => updateStatus(b, "APPROVED")}>{ar.bookings.approve}</Button>
                      <Button size="sm" variant="outline" disabled={acting} onClick={() => updateStatus(b, "DECLINED")}>{ar.bookings.decline}</Button>
                    </>
                  )}
                  {isMentor && b.status === "APPROVED" && (
                    <Button size="sm" onClick={() => { setMeetingDialog(b); setMeetingLink(""); setMentorNotes(""); }}><Video className="h-4 w-4" /> {ar.bookings.startSession}</Button>
                  )}
                  {!isMentor && b.status === "PENDING" && (
                    <Button size="sm" variant="outline" disabled={acting} onClick={() => updateStatus(b, "CANCELLED")}>{ar.bookings.cancel}</Button>
                  )}
                  {!isMentor && b.status === "APPROVED" && (
                    <Button size="sm" variant="outline" disabled={acting} onClick={() => updateStatus(b, "CANCELLED")}>{ar.bookings.cancel}</Button>
                  )}
                  {!isMentor && b.status === "COMPLETED" && !b.studentRating && (
                    <Button size="sm" onClick={() => { setFeedbackDialog(b); setFeedback(""); setRating(0); }}><Star className="h-4 w-4" /> {ar.bookings.review}</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!meetingDialog} onOpenChange={(open) => !open && setMeetingDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{ar.bookings.completeSession}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{ar.bookings.meetingLink}</Label>
              <Input placeholder="https://meet.google.com/..." value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{ar.bookings.notesForStudent}</Label>
              <Textarea value={mentorNotes} onChange={(e) => setMentorNotes(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => updateStatus(meetingDialog!, "APPROVED", { meetingLink })}>
                {ar.bookings.saveLinkOnly}
              </Button>
              <Button className="flex-1" disabled={acting} onClick={() => updateStatus(meetingDialog!, "COMPLETED", { meetingLink, mentorNotes })}>
                {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : null} {ar.bookings.markCompleted}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!feedbackDialog} onOpenChange={(open) => !open && setFeedbackDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{ar.bookings.rateMentor}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <button key={i} onClick={() => setRating(i + 1)} className="text-2xl transition-transform hover:scale-110" aria-label={`Rate ${i + 1} stars`}>
                  <Star className={cn("h-7 w-7", i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <Label>{ar.bookings.yourFeedback}</Label>
              <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder={ar.bookings.howWasSession} />
            </div>
            <Button className="w-full" disabled={acting || rating === 0} onClick={() => updateStatus(feedbackDialog!, "COMPLETED", { studentFeedback: feedback, studentRating: rating })}>
              {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
              {ar.bookings.submitReview}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
