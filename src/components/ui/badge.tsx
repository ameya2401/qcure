import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

const toneClasses = {
  info: "bg-primary/10 text-primary",
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  danger: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  neutral: "bg-muted text-muted-foreground",
} as const;

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: keyof typeof toneClasses;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
        toneClasses[tone],
      )}
    >
      {children}
    </span>
  );
}
