"use client";

import { useState, useEffect } from "react";
import { createJob, updateJob } from "@/app/(dashboard)/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  JOB_STATUSES,
  normalizeJobStatus,
  type Job,
  type JobInsert,
  type JobStatus,
} from "@/lib/types";

interface JobFormModalProps {
  job?: Job;
  open: boolean;
  onClose: () => void;
  onSaved?: (job: Job) => void;
}

function isNextRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export function JobFormModal({ job, open, onClose, onSaved }: JobFormModalProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [experienceRequired, setExperienceRequired] = useState("Fresh");
  const [dateApplied, setDateApplied] = useState("");
  const [status, setStatus] = useState<JobStatus>("Applied");
  const [jobLink, setJobLink] = useState("");
  const [notes, setNotes] = useState("");

  // Use local time for date calculation instead of UTC to avoid timezone boundary issues
  const today = new Date();
  const todayDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0];

  // Reset form state when modal opens or job changes
  useEffect(() => {
    if (open) {
      setCompany(job?.company_name || "");
      setTitle(job?.job_title || "");
      setExperienceRequired(job?.experience_required || "Fresh");
      setDateApplied(job?.date_applied || "");
      setStatus(normalizeJobStatus(job?.status));
      setJobLink(job?.job_link || "");
      setNotes(job?.notes || "");
      setError(null);
      setIsPending(false);
    }
  }, [open, job]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    if (!company || !title || !dateApplied || !experienceRequired) {
      setError("Company, title, experience, and date are required");
      setIsPending(false);
      return;
    }

    if (dateApplied > todayDate) {
      setError("Date applied cannot be in the future");
      setIsPending(false);
      return;
    }

    const normalizedStatus = normalizeJobStatus(status);

    const payload = {
      company_name: company,
      job_title: title,
      experience_required: experienceRequired,
      date_applied: dateApplied,
      status: normalizedStatus,
      job_link: jobLink || null,
      notes: notes || null,
    };

    try {
      let savedJob: Job;
      if (job) {
        savedJob = await updateJob(job.id, payload);
      } else {
        savedJob = await createJob(payload as JobInsert);
      }
      onSaved?.(savedJob);
    } catch (err) {
      if (isNextRedirectError(err)) throw err;
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      setIsPending(false);
      return;
    }

    setIsPending(false);
    onClose();
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="glass-panel organic-rise-in relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow behind the modal */}
        <div className="absolute inset-0 bg-violet-600/10 blur-[80px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 relative z-10 bg-black/20">
          <h2 className="text-xl font-bold tracking-tight text-white">
            {job ? "Edit Application" : "Add Application"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="overflow-y-auto p-6 relative z-10 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200 backdrop-blur-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="company" className="text-zinc-300">Company Name <span className="text-red-400">*</span></Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Inc."
                required
                className="bg-black/50 border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20 h-11 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-zinc-300">Job Title <span className="text-red-400">*</span></Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Senior Engineer"
                required
                className="bg-black/50 border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20 h-11 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience" className="text-zinc-300">Experience Required <span className="text-red-400">*</span></Label>
              <select
                id="experience"
                value={experienceRequired}
                onChange={(e) => setExperienceRequired(e.target.value)}
                required
                className="appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23a3a3a3%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[position:right_0.75rem_center] bg-no-repeat pr-10 h-11 w-full rounded-lg border border-white/10 bg-black/50 pl-3 text-sm text-zinc-100 transition-all focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 outline-none"
              >
                <option value="Fresh">Fresh</option>
                <option value="0-6 months">0-6 months</option>
                <option value="0-1 year">0-1 year</option>
                <option value="1-3 years">1-3 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5+ years">5+ years</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-zinc-300">Date Applied <span className="text-red-400">*</span></Label>
              <Input
                id="date"
                type="date"
                value={dateApplied}
                max={todayDate}
                onChange={(e) => setDateApplied(e.target.value)}
                onClick={(e) => {
                  try {
                    if ("showPicker" in HTMLInputElement.prototype) {
                      e.currentTarget.showPicker();
                    }
                  } catch (err) {}
                }}
                required
                className="relative w-full cursor-pointer bg-black/50 border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20 h-11 transition-all pr-3 pl-3 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-zinc-300">Status <span className="text-red-400">*</span></Label>
              <select
                id="status"
                value={status}
                onChange={(e) =>
                  setStatus(normalizeJobStatus(e.target.value))
                }
                required
                className="appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23a3a3a3%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[position:right_0.75rem_center] bg-no-repeat pr-10 h-11 w-full rounded-lg border border-white/10 bg-black/50 pl-3 text-sm text-zinc-100 transition-all focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 outline-none"
              >
                {JOB_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="link" className="text-zinc-300">Job Link <span className="text-zinc-500">(optional)</span></Label>
              <Input
                id="link"
                type="url"
                value={jobLink}
                onChange={(e) => setJobLink(e.target.value)}
                placeholder="https://..."
                className="bg-black/50 border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20 h-11 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-zinc-300">Notes <span className="text-zinc-500">(optional)</span></Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes..."
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 transition-all focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="pt-2">
              <p className="text-xs text-zinc-500">
                Fields marked with <span className="text-red-400">*</span> are required.
              </p>
            </div>

            {/* Footer */}
            <div className="flex gap-3 pt-4 border-t border-white/10 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isPending}
                className="flex-1 h-11 bg-white/5 hover:bg-white/10 text-white border-transparent transition-all"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 h-11 bg-violet-600 hover:bg-violet-500 text-white font-medium tracking-wide shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] transition-all border border-violet-500/50"
              >
                {isPending ? "Saving..." : job ? "Save changes" : "Save application"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
