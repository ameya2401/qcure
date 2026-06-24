import { cn } from "@/utils/cn";
import type { PatientStatus } from "@/types/queue";

const statusStyles: Record<PatientStatus, string> = {
  WAITING: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  ACTIVE: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  COMPLETED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
};

export function QueueStatusPill({ status }: { status: PatientStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
        statusStyles[status],
      )}
    >
      {status}
    </span>
  );
}
