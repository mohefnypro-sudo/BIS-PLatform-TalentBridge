"use client";

import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import * as React from "react";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}

export function AnimatedNumber({ value, duration = 1.4, format = (n) => String(n), className }: AnimatedNumberProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const motionValue = useMotionValue(0);
  const text = useTransform(motionValue, (v) => format(Math.round(v)));

  React.useEffect(() => {
    if (inView) {
      const controls = animate(motionValue, value, { duration, ease: [0.16, 1, 0.3, 1] });
      return controls.stop;
    }
  }, [inView, value, duration, motionValue]);

  return <motion.span ref={ref} className={className} style={{ opacity: inView ? 1 : 0 }}>{text}</motion.span>;
}
