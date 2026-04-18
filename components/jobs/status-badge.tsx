import { cn } from "@/lib/utils";
import type { JobStatus } from "@/lib/types";

const statusConfig: Record<
  JobStatus,
  { label: string; className: string }
> = {
  Applied: {
    label: "Applied",
    className:
      "bg-blue-950/40 text-blue-400 ring-1 ring-blue-800",
  },
  Interviewing: {
    label: "Interviewing",
    className:
      "bg-amber-950/40 text-amber-400 ring-1 ring-amber-800",
  },
  Offer: {
    label: "Offer",
    className:
      "bg-green-950/40 text-green-400 ring-1 ring-green-800",
  },
  Rejected: {
    label: "Rejected",
    className:
      "bg-zinc-800 text-zinc-400 ring-1 ring-zinc-700",
  },
};

export function StatusBadge({ status }: { status: JobStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
