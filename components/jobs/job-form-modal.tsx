"use client";

import { useState, useEffect } from "react";
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
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [experienceRequired, setExperienceRequired] = useState("Fresh");
  const [dateApplied, setDateApplied] = useState("");
  const [status, setStatus] = useState<JobStatus>("Applied");
  const [jobLink, setJobLink] = useState("");
  const [notes, setNotes] = useState("");

  const todayDate = new Date().toISOString().split("T")[0];

  // Reset form state when modal opens or job changes
  useEffect(() => {
    console.log("JobFormModal useEffect:", { open, job });
    if (open) {
      setCompany(job?.company_name || "");
      setTitle(job?.job_title || "");
      setExperienceRequired(job?.experience_required || "Fresh");
      setDateApplied(job?.date_applied || "");
      setStatus(job?.status || "Applied");
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

    if (new Date(dateApplied) > new Date()) {
      setError("Date applied cannot be in the future");
      setIsPending(false);
      return;
    }

    try {
      const payload = {
        company_name: company,
        job_title: title,
        experience_required: experienceRequired,
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
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      console.error("Form submission error:", err);
    } finally {
      setIsPending(false);
    }
  };

  if (!open) {
    console.log("JobFormModal returning null, open:", open);
    return null;
  }

  console.log("JobFormModal rendering, job:", job);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg glass-panel rounded-2xl shadow-2xl relative flex flex-col max-h-[90vh] border border-white/10 bg-zinc-950/80 overflow-hidden"
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
                className="h-11 w-full rounded-lg border border-white/10 bg-black/50 px-3 text-sm text-zinc-100 transition-all focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 outline-none"
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
                required
                className="bg-black/50 border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20 h-11 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-zinc-300">Status <span className="text-red-400">*</span></Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
                className="h-11 w-full rounded-lg border border-white/10 bg-black/50 px-3 text-sm text-zinc-100 transition-all focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 outline-none"
              >
                <option value="Applied">Applied</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Interviewed">Interviewed</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
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


