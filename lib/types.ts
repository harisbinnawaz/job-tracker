export type JobStatus = "Applied" | "Interviewing" | "Offer" | "Rejected";

export interface Job {
  id: string;
  user_id: string;
  company_name: string;
  job_title: string;
  date_applied: string; // ISO date string: YYYY-MM-DD
  status: JobStatus;
  job_link: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type JobInsert = Omit<Job, "id" | "user_id" | "created_at" | "updated_at">;
export type JobUpdate = Partial<JobInsert>;