"use client";

import { cn } from "@/lib/utils";

interface AuroraBackgroundProps {
  className?: string;
  variant?: "dark" | "light";
}

export function AuroraBackground({ className, variant = "dark" }: AuroraBackgroundProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div className="absolute -top-40 -left-32 h-[42rem] w-[42rem] rounded-full bg-indigo-600/30 blur-[120px] animate-aurora-slow" />
      <div className="absolute top-1/3 -right-40 h-[38rem] w-[38rem] rounded-full bg-fuchsia-600/25 blur-[130px] animate-aurora-slow [animation-delay:-4s]" />
      <div className="absolute -bottom-48 left-1/3 h-[36rem] w-[36rem] rounded-full bg-amber-400/15 blur-[140px] animate-aurora-slow [animation-delay:-8s]" />
      <div className="absolute top-10 left-1/2 h-72 w-72 rounded-full bg-violet-500/20 blur-[100px] animate-aurora-slow [animation-delay:-2s]" />
      <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
      {variant === "dark" ? (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      ) : null}
    </div>
  );
}
