"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Compass, GraduationCap, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ar } from "@/lib/i18n";

type Role = "STUDENT" | "MENTOR" | "RECRUITER";

const roleOptions: { value: Role; label: string; icon: typeof GraduationCap; description: string }[] = [
  { value: "STUDENT", label: ar.register.student, icon: GraduationCap, description: ar.register.studentDesc },
  { value: "MENTOR", label: ar.register.mentor, icon: Compass, description: ar.register.mentorDesc },
  { value: "RECRUITER", label: ar.register.recruiter, icon: Briefcase, description: ar.register.recruiterDesc },
];

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialRole = params.get("role") as Role | null;

  const [role, setRole] = useState<Role>(initialRole ?? "STUDENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? ar.register.regError);
        setLoading(false);
        return;
      }
      router.push("/login?registered=1");
    } catch {
      setError(ar.register.networkError);
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="w-full max-w-md rounded-3xl border border-border/60 bg-card/90 p-8 shadow-2xl backdrop-blur-xl"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h1 className="font-display text-3xl font-bold tracking-tight">{ar.register.title}</h1>
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">{ar.register.subtitle}</p>

      <div className="mt-6 grid grid-cols-3 gap-2">
        {roleOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setRole(option.value)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-all",
              role === option.value
                ? "border-primary/60 bg-primary/10 shadow-lg shadow-primary/10"
                : "border-border/60 hover:border-primary/30 hover:bg-muted/40",
            )}
          >
            <option.icon className={cn("h-5 w-5", role === option.value ? "text-primary" : "text-muted-foreground")} />
            <span className="text-xs font-semibold">{option.label}</span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {roleOptions.find((r) => r.value === role)?.description}
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{ar.register.fullName}</Label>
          <Input id="name" required placeholder={ar.register.namePlaceholder} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{ar.register.email}</Label>
          <Input id="email" type="email" required placeholder={ar.login.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{ar.register.password}</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            placeholder={ar.register.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </motion.p>
        )}

        <Button type="submit" size="lg" variant="glow" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? ar.register.submitting : ar.register.submit}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {ar.register.hasAccount}{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          {ar.register.signIn}
        </Link>
      </p>
    </motion.div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
