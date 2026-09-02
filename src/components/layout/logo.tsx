import { cn } from "@/lib/utils";
import Link from "next/link";

interface LogoProps {
  className?: string;
  href?: string;
  size?: "sm" | "md";
}

export function Logo({ className, href = "/", size = "md" }: LogoProps) {
  const mark = (
    <span
      className={cn(
        "relative inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 font-display font-bold text-white shadow-lg shadow-indigo-500/30",
        size === "sm" ? "h-8 w-8 text-sm" : "h-10 w-10 text-base",
        className,
      )}
    >
      TB
    </span>
  );

  return (
    <Link href={href} className="group flex items-center gap-2.5">
      {mark}
      <span
        className={cn(
          "font-display font-bold tracking-tight text-foreground",
          size === "sm" ? "text-base" : "text-lg",
        )}
      >
        Talent<span className="text-gradient">Bridge</span>
      </span>
    </Link>
  );
}
