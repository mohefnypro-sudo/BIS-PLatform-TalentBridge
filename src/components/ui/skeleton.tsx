"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const skeletonVariants = cva("animate-pulse rounded-md bg-muted/70", {
  variants: {
    variant: {
      default: "",
      gradient: "bg-gradient-to-r from-indigo-500/30 via-fuchsia-500/30 to-amber-400/30",
      glass: "bg-white/10",
    },
  },
  defaultVariants: { variant: "default" },
});

function Skeleton({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof skeletonVariants>) {
  return <div className={cn(skeletonVariants({ variant }), className)} {...props} />;
}

export { Skeleton };
