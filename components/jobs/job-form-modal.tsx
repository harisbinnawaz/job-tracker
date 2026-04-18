"use client";

import { useState } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createJob, updateJob } from "@/app/(dashboard)/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Job, JobInsert, JobStatus } from "@/lib/types";

interface JobFormModalProps {
  job?: Job;
  open: boolean;
  onClose: () => void;
}

export function JobFormModal({ job, open, onClose }: JobFormModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [company, setCompany] = useState(job?.company_name || "");
  const [title, setTitle] = useState(job?.job_title || "");
  const [dateApplied, setDateApplied] = useState(job?.date_applied || "");
  const [status, setStatus] = useState<JobStatus>(job?.status || "Applied");
  const [jobLink, setJobLink] = useState(job?.job_link || "");
  const [notes, setNotes] = useState(job?.notes || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!company || !title || !dateApplied) {
      setError("Company, title, and date are required");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          company_name: company,
          job_title: title,
          date_applied: dateApplied,
          status,
          job_link: jobLink || null,
          notes: notes || null,
        };

        if (job) {
          await updateJob(job.id, payload);
        } else {
          await createJob(payload as JobInsert);
        }

        router.refresh();
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-100">
            {job ? "Edit Application" : "Add Application"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="rounded-md border border-red-900 bg-red-950/30 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="company">Company Name</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Acme Inc."
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Senior Engineer"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="date">Date Applied</Label>
            <Input
              id="date"
              type="date"
              value={dateApplied}
              onChange={(e) => setDateApplied(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as JobStatus)}
              className="h-9 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 transition-colors"
            >
              <option value="Applied">Applied</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="link">Job Link (optional)</Label>
            <Input
              id="link"
              type="url"
              value={jobLink}
              onChange={(e) => setJobLink(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes..."
              rows={3}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1 text-sm text-zinc-100 placeholder:text-zinc-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isPending}
              className="flex-1"
            >
              {isPending ? "Saving..." : job ? "Save changes" : "Save application"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

