"use client";

import { motion, useInView } from "framer-motion";
import * as React from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  x?: number;
  duration?: number;
  once?: boolean;
  className?: string;
  whileInView?: boolean;
}

export function Reveal({
  children,
  delay = 0,
  y = 28,
  x = 0,
  duration = 0.6,
  once = true,
  className,
  whileInView = true,
}: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, x, filter: "blur(6px)" }}
      whileInView={whileInView ? { opacity: 1, y: 0, x: 0, filter: "blur(0px)" } : undefined}
      animate={whileInView ? undefined : { opacity: 1, y: 0, x: 0, filter: "blur(0px)" }}
      viewport={whileInView ? { once, amount: 0.2 } : undefined}
      transition={{ duration, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}

export function useInViewOnce(ref: React.RefObject<HTMLElement | null>, amount = 0.3) {
  const inView = useInView(ref, { once: true, amount });
  return inView;
}

export function Stagger({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={cn("flex flex-col", className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] } },
      }}
    >
      {children}
    </motion.div>
  );
}
