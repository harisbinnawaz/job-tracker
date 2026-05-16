export const JOB_STATUSES = [
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export type ExperienceLevel =
  | "Fresh"
  | "0-6 months"
  | "0-1 year"
  | "1-3 years"
  | "3-5 years"
  | "5+ years";

export interface Job {
  id: string;
  user_id: string;
  company_name: string;
  job_title: string;
  experience_required: string;
  date_applied: string; // ISO date string: YYYY-MM-DD
  status: JobStatus;
  job_link: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type JobInsert = Omit<Job, "id" | "user_id" | "created_at" | "updated_at">;
export type JobUpdate = Partial<JobInsert>;

export function isJobStatus(value: string | undefined | null): value is JobStatus {
  return JOB_STATUSES.includes(value as JobStatus);
}

export function normalizeJobStatus(
  value: string | undefined | null,
  fallback: JobStatus = "Applied"
): JobStatus {
  return isJobStatus(value) ? value : fallback;
}
