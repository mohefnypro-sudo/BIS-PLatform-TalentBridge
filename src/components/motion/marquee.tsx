"use client";

import { cn } from "@/lib/utils";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  speed?: number;
  reverse?: boolean;
}

export function Marquee({ children, speed = 40, reverse = false, className, ...props }: MarqueeProps) {
  return (
    <div className={cn("group relative overflow-hidden", className)} {...props}>
      <div
        className={cn(
          "flex w-max items-center gap-6 animate-marquee group-hover:[animation-play-state:paused]",
          reverse && "[animation-direction:reverse]",
        )}
        style={{ animationDuration: `${speed}s` }}
      >
        <div className="flex items-center gap-6 pr-6">{children}</div>
        <div className="flex items-center gap-6 pr-6" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
