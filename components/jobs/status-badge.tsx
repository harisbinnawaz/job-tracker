import { cn } from "@/lib/utils";
import type { JobStatus } from "@/lib/types";

const statusConfig: Record<
  JobStatus,
  { label: string; className: string }
> = {
  Applied: {
    label: "Applied",
    className:
      "bg-blue-500/10 text-blue-300 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]",
  },
  Interviewing: {
    label: "Interviewing",
    className:
      "bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]",
  },
  Interviewed: {
    label: "Interviewed",
    className:
      "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]",
  },
  Offer: {
    label: "Offer",
    className:
      "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
  },
  Rejected: {
    label: "Rejected",
    className:
      "bg-zinc-500/10 text-zinc-300 border border-zinc-500/30 shadow-[0_0_10px_rgba(161,161,170,0.1)]",
  },
};

export function StatusBadge({ status }: { status: JobStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide backdrop-blur-sm",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
