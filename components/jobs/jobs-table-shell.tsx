"use client";

import { JobsTable } from "./jobs-table";
import type { Job } from "@/lib/types";

interface JobsTableShellProps {
  initialJobs: Job[];
}

export default function JobsTableShell({ initialJobs }: JobsTableShellProps) {
  return <JobsTable initialJobs={initialJobs} />;
}
