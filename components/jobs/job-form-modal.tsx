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
    let cancelled = false;

    if (open) {
      queueMicrotask(() => {
        if (cancelled) return;

        setCompany(job?.company_name || "");
        setTitle(job?.job_title || "");
        setExperienceRequired(job?.experience_required || "Fresh");
        setDateApplied(job?.date_applied || "");
        setStatus(normalizeJobStatus(job?.status));
        setJobLink(job?.job_link || "");
        setNotes(job?.notes || "");
        setError(null);
        setIsPending(false);
      });
    }

    return () => {
      cancelled = true;
    };
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
      className="theme-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="glass-panel organic-rise-in relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow behind the modal */}
        <div className="theme-ambient-primary pointer-events-none absolute inset-0 rounded-full blur-[80px]" />

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
              <div className="theme-alert-danger rounded-lg border px-4 py-3 text-sm backdrop-blur-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="company" className="form-label">Company Name <span className="text-red-400">*</span></Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Inc."
                required
                className="h-11 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="form-label">Job Title <span className="text-red-400">*</span></Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Senior Engineer"
                required
                className="h-11 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience" className="form-label">Experience Required <span className="text-red-400">*</span></Label>
              <select
                id="experience"
                value={experienceRequired}
                onChange={(e) => setExperienceRequired(e.target.value)}
                required
                className="theme-select h-11 w-full rounded-lg border px-3 pr-10 text-sm transition-all outline-none"
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
              <Label htmlFor="date" className="form-label">Date Applied <span className="text-red-400">*</span></Label>
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
                  } catch {}
                }}
                required
                className="relative h-11 w-full cursor-pointer pr-3 pl-3 transition-all [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="form-label">Status <span className="text-red-400">*</span></Label>
              <select
                id="status"
                value={status}
                onChange={(e) =>
                  setStatus(normalizeJobStatus(e.target.value))
                }
                required
                className="theme-select h-11 w-full rounded-lg border px-3 pr-10 text-sm transition-all outline-none"
              >
                {JOB_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="link" className="form-label">Job Link <span className="form-helper">(optional)</span></Label>
              <Input
                id="link"
                type="url"
                value={jobLink}
                onChange={(e) => setJobLink(e.target.value)}
                placeholder="https://..."
                className="h-11 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="form-label">Notes <span className="form-helper">(optional)</span></Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes..."
                rows={3}
                className="form-field w-full rounded-lg border px-3 py-2 text-sm transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="pt-2">
              <p className="form-helper text-xs">
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
                className="h-11 flex-1 whitespace-nowrap px-2 text-sm transition-all sm:px-4 sm:text-base"
              >
                Cancel
              </Button>
              <button
                type="submit"
                disabled={isPending}
                className="theme-primary inline-flex h-11 flex-1 items-center justify-center truncate rounded-md border px-2 text-sm font-medium tracking-wide transition-all disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-base"
              >
                {isPending ? "Saving..." : job ? "Save changes" : "Save application"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
