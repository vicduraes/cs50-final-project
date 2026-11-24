import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "movie" | "book" | "theater" | "exhibition" | "concert" | "accent";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-paper-subtle text-ink-muted border-paper-border",
    movie: "bg-amber-50 text-amber-900 border-amber-200",
    book: "bg-emerald-50 text-emerald-900 border-emerald-200",
    theater: "bg-rose-50 text-rose-900 border-rose-200",
    exhibition: "bg-sky-50 text-sky-900 border-sky-200",
    concert: "bg-purple-50 text-purple-900 border-purple-200",
    accent: "bg-accent-soft text-accent border-accent/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}