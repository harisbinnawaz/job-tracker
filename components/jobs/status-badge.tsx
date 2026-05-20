import { cn } from "@/lib/utils";
import type { JobStatus } from "@/lib/types";

const statusConfig: Record<
  JobStatus,
  { label: string; className: string }
> = {
  Applied: {
    label: "Applied",
    className: "status-badge status-applied",
  },
  Interviewing: {
    label: "Interviewing",
    className: "status-badge status-interviewing",
  },
  Interviewed: {
    label: "Interviewed",
    className: "status-badge status-interviewed",
  },
  Offer: {
    label: "Offer",
    className: "status-badge status-offer",
  },
  Rejected: {
    label: "Rejected",
    className: "status-badge status-rejected",
  },
};

export function StatusBadge({ status }: { status: JobStatus }) {
  const config =
    statusConfig[status] ??
    statusConfig.Applied;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide backdrop-blur-sm",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
