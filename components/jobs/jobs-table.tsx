"use client";

import { useState, useMemo, useEffect } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteJob } from "@/app/(dashboard)/actions";
import { JobFormModal } from "./job-form-modal";
import { StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowUpDown,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Clock,
  ExternalLink,
  FileText,
  Inbox,
  Pencil,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { JOB_STATUSES, type Job, type JobStatus } from "@/lib/types";

interface JobsTableProps {
  initialJobs: Job[];
}

const metricStyles: Record<JobStatus, string> = {
  Applied: "status-card status-applied",
  Interviewing: "status-card status-interviewing",
  Interviewed: "status-card status-interviewed",
  Offer: "status-card status-offer",
  Rejected: "status-card status-rejected",
};

const spacedCellClass =
  "border-y border-[var(--border)] bg-[var(--surface)] px-5 py-4 transition-all duration-200 ease-out group-hover:scale-[1.012] group-hover:bg-[var(--surface-strong)] group-hover:shadow-[0_20px_42px_-32px_var(--accent-glow)] group-focus-visible:scale-[1.012] group-focus-visible:bg-[var(--surface-strong)]";
const centeredCellClass = `${spacedCellClass} align-middle`;
const stackedCellClass = `${spacedCellClass} align-top`;

function formatJobDate(value: string | null | undefined) {
  if (!value) {
    return "N/A";
  }

  try {
    const parsed = parseISO(value);
    return isNaN(parsed.getTime()) ? "Invalid Date" : format(parsed, "MMM d, yyyy");
  } catch {
    return "Invalid Date";
  }
}

function formatJobDateTime(value: string | null | undefined) {
  if (!value) {
    return "N/A";
  }

  try {
    const parsed = parseISO(value);
    return isNaN(parsed.getTime()) ? "Invalid Date" : format(parsed, "MMM d, yyyy, h:mm a");
  } catch {
    return "Invalid Date";
  }
}

export function JobsTable({ initialJobs }: JobsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "All">("All");
  const [experienceFilter, setExperienceFilter] = useState<string | "All">("All");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sync state when server data changes (fixes the refresh bug)
  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    if (statusFilter !== "All") {
      result = result.filter((job) => job.status === statusFilter);
    }

    if (experienceFilter !== "All") {
      result = result.filter((job) => job.experience_required === experienceFilter);
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (job) =>
          (job.company_name?.toLowerCase() || "").includes(q) ||
          (job.job_title?.toLowerCase() || "").includes(q)
      );
    }

    result.sort((a, b) => {
      const dateA = parseISO(a.date_applied || "1970-01-01");
      const dateB = parseISO(b.date_applied || "1970-01-01");
      return sortOrder === "desc"
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });

    return result;
  }, [jobs, searchQuery, statusFilter, experienceFilter, sortOrder]);

  const statusMetrics = useMemo(
    () =>
      JOB_STATUSES.map((status) => ({
        status,
        count: jobs.filter((job) => job.status === status).length,
      })),
    [jobs]
  );

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
  };

  const handleConfirmDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteJob(id);
        setJobs((prev) => prev.filter((j) => j.id !== id));
        setDeletingId(null);
        router.refresh();
      } catch (error) {
        console.error("Failed to delete job:", error);
      }
    });
  };

  const handleEditClose = () => {
    setEditingJob(null);
    router.refresh();
  };

  const handleAddClose = () => {
    setIsAddModalOpen(false);
    router.refresh();
  };

  const handleJobSaved = (savedJob: Job) => {
    setJobs((prev) => {
      const exists = prev.some((job) => job.id === savedJob.id);
      return exists
        ? prev.map((job) => (job.id === savedJob.id ? savedJob : job))
        : [savedJob, ...prev];
    });
  };

  const handleRowKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>, job: Job) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setViewingJob(job);
    }
  };

  if (jobs.length === 0) {
    return (
      <>
        <div className="text-center py-16 glass-panel rounded-2xl relative overflow-hidden">
          <div className="theme-ambient-primary absolute inset-0 blur-[100px] pointer-events-none" />
          <div className="relative z-10">
            <Inbox className="h-14 w-14 mx-auto text-violet-400/50 mb-5" />
            <h2 className="text-xl font-semibold text-white mb-2">
              No applications yet
            </h2>
            <p className="text-sm text-zinc-400 mb-8 max-w-sm mx-auto">
              Start tracking your applications to stay organized. Your career journey begins here.
            </p>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="font-medium tracking-wide transition-all"
            >
              Add Application
            </Button>
          </div>
        </div>

        <JobFormModal
          open={isAddModalOpen}
          onClose={handleAddClose}
          onSaved={handleJobSaved}
        />
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 w-full flex-wrap overflow-hidden sm:overflow-visible">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-white tracking-tight truncate">
            Applications
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Showing {filteredJobs.length} of {jobs.length} application
            {jobs.length !== 1 ? "s" : ""}
            {statusFilter !== "All" && ` · ${statusFilter}`}
            {searchQuery && ` · "${searchQuery}"`}
          </p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="font-medium tracking-wide transition-all w-full sm:w-auto shrink-0"
        >
          Add Application
        </Button>
      </div>

      {/* Metrics */}
      <div className="scrollbar-none mb-6 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-smooth pb-1 pr-4 lg:grid lg:grid-cols-6 lg:overflow-visible lg:pr-0">
        <div 
          className="card-emergence glass-panel w-[min(78vw,16rem)] flex-none snap-start rounded-xl border-white/10 bg-gradient-to-br from-white/10 to-white/[0.03] p-4 lg:col-span-1 lg:w-auto hover:scale-110 transition-transform duration-300 ease-out"
          style={{ animationDelay: '0ms' }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Total
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white">
            {jobs.length}
          </p>
        </div>
        {statusMetrics.map(({ status, count }, index) => (
          <div
            key={status}
            className={`card-emergence w-[min(78vw,16rem)] flex-none snap-start rounded-xl border bg-gradient-to-br p-4 shadow-[0_18px_45px_-28px_rgba(0,0,0,0.85)] last:mr-4 lg:w-auto lg:last:mr-0 hover:scale-110 transition-transform duration-300 ease-out ${metricStyles[status]}`}
            style={{ animationDelay: `${(index + 1) * 75}ms` }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-current/70">
              {status}
            </p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <p className="text-3xl font-bold tracking-tight text-white">
                {count}
              </p>
              <span className="pb-1 text-xs font-medium text-zinc-500">
                {jobs.length > 0 ? Math.round((count / jobs.length) * 100) : 0}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row glass-panel p-2 rounded-xl">
        <div className="relative flex-1 min-w-48">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            className="h-10 rounded-lg pl-9 transition-all"
            placeholder="Search company or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={experienceFilter}
          onChange={(e) => setExperienceFilter(e.target.value)}
          className="theme-select h-10 rounded-lg border px-3 pr-10 text-sm transition-all outline-none"
        >
          <option value="All">All Experiences</option>
          <option value="Fresh">Fresh</option>
          <option value="0-6 months">0-6 months</option>
          <option value="0-1 year">0-1 year</option>
          <option value="1-3 years">1-3 years</option>
          <option value="3-5 years">3-5 years</option>
          <option value="5+ years">5+ years</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as JobStatus | "All")}
          className="theme-select h-10 rounded-lg border px-3 pr-10 text-sm transition-all outline-none"
        >
          <option value="All">All statuses</option>
          {JOB_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setSortOrder((o) => (o === "desc" ? "asc" : "desc"))}
          className="h-10 gap-2 rounded-lg transition-all"
        >
          <ArrowUpDown className="h-4 w-4" />
          {sortOrder === "desc" ? "Newest first" : "Oldest first"}
        </Button>
      </div>

      {/* Table */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12 glass-panel rounded-2xl">
          <Inbox className="h-10 w-10 mx-auto text-zinc-500 mb-3" />
          <p className="text-base font-medium text-zinc-200 mb-1">
            No results found
          </p>
          <p className="text-sm text-zinc-500 mb-6">
            Try adjusting your search or filter.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("All");
              setExperienceFilter("All");
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden md:block w-full max-w-full overflow-x-auto rounded-2xl glass-panel px-3 pb-3">
            <table className="w-full min-w-[980px] border-separate border-spacing-y-3 text-left">
              <thead>
                <tr>
                  <th className="px-5 pb-1 pt-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                    Company
                  </th>
                  <th className="px-5 pb-1 pt-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                    Role & Notes
                  </th>
                  <th className="px-5 pb-1 pt-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                    Experience
                  </th>
                  <th className="px-5 pb-1 pt-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                    Date Applied
                  </th>
                  <th className="px-5 pb-1 pt-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                    Status
                  </th>
                  <th className="px-5 pb-1 pt-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                    Link
                  </th>
                  <th className="px-5 pb-1 pt-4 text-right text-xs font-semibold uppercase tracking-widest text-zinc-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job, index) => (
                  <tr
                    key={job.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setViewingJob(job)}
                    onKeyDown={(event) => handleRowKeyDown(event, job)}
                    aria-label={`View details for ${job.job_title} at ${job.company_name}`}
                    className="organic-rise-row group cursor-pointer outline-none"
                    style={{ animationDelay: `${Math.min(index * 42, 260)}ms` }}
                  >
                    <td className={`${centeredCellClass} rounded-l-xl border-l`}>
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="theme-accent-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {job.company_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={stackedCellClass}>
                      <div className="max-w-[26rem]">
                        <p className="text-sm font-medium text-zinc-200">
                          {job.job_title}
                        </p>
                        {job.notes ? (
                          <p className="mt-2 max-h-10 overflow-hidden text-xs leading-5 text-zinc-500">
                            {job.notes}
                          </p>
                        ) : (
                          <p className="mt-2 text-xs leading-5 text-zinc-600">
                            No notes attached
                          </p>
                        )}
                      </div>
                    </td>
                    <td className={`${centeredCellClass} text-sm text-zinc-400`}>
                      <span className="text-sm text-zinc-400">
                        {job.experience_required}
                      </span>
                    </td>
                    <td className={`${centeredCellClass} text-sm text-zinc-400`}>
                      <span className="text-sm text-zinc-400" suppressHydrationWarning>
                        {formatJobDate(job.date_applied)}
                      </span>
                    </td>
                    <td className={`${centeredCellClass} text-sm`}>
                      <StatusBadge status={job.status} />
                    </td>
                    <td className={`${centeredCellClass} text-sm`}>
                      {job.job_link ? (
                        <a
                          href={job.job_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) => event.stopPropagation()}
                          className="inline-flex items-center justify-center p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                          aria-label={`Open job posting for ${job.company_name}`}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td
                      className={`${centeredCellClass} rounded-r-xl border-r text-right`}
                      onClick={(event) => event.stopPropagation()}
                    >
                      {deletingId === job.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-zinc-400">Delete?</span>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={() => handleConfirmDelete(job.id)}
                            disabled={isPending}
                          >
                            Yes
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs hover:bg-white/10"
                            onClick={() => setDeletingId(null)}
                            disabled={isPending}
                          >
                            No
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10"
                            onClick={() => setEditingJob(job)}
                            title="Edit"
                            aria-label={`Edit ${job.company_name} application`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(job.id)}
                            className="theme-danger-control h-8 w-8 border"
                            title="Delete"
                            aria-label={`Delete ${job.company_name} application`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="block md:hidden w-full space-y-4 pb-4 overflow-x-hidden">
            {filteredJobs.map((job, index) => (
              <div
                key={job.id}
                role="button"
                tabIndex={0}
                onClick={() => setViewingJob(job)}
                onKeyDown={(event) => handleRowKeyDown(event, job)}
                aria-label={`View details for ${job.job_title} at ${job.company_name}`}
                className="flex flex-col gap-3 relative p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-strong)] active:scale-[0.99] transition-all cursor-pointer shadow-sm w-full organic-rise-row"
                style={{ animationDelay: `${Math.min(index * 42, 260)}ms` }}
              >
                <div className="absolute top-5 right-5 z-10">
                  <StatusBadge status={job.status} />
                </div>
                
                <div className="flex items-center gap-3 pr-24">
                  <div className="theme-accent-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-black/20">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-white">
                      {job.company_name}
                    </p>
                    <p className="truncate text-sm font-medium text-zinc-300">
                      {job.job_title}
                    </p>
                  </div>
                </div>

                {job.notes && (
                  <div className="mt-1 rounded-lg bg-black/10 p-3 border border-white/[0.05]">
                    <p className="line-clamp-2 text-xs leading-5 text-zinc-400">
                      {job.notes}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mt-1 pt-4 border-t border-white/[0.05]">
                  <div>
                    <span className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                      Experience
                    </span>
                    <span className="text-sm text-zinc-300">
                      {job.experience_required}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                      Date Applied
                    </span>
                    <span className="text-sm text-zinc-300" suppressHydrationWarning>
                      {formatJobDate(job.date_applied)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/[0.05]" onClick={(e) => e.stopPropagation()}>
                  <div>
                    {job.job_link ? (
                      <a
                        href={job.job_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] hover:text-white transition-colors py-1.5 px-3 rounded-md bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View Posting
                      </a>
                    ) : (
                      <span className="text-xs text-zinc-600 py-1.5">No link provided</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {deletingId === job.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400">Delete?</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-7 px-2 text-[10px]"
                          onClick={() => handleConfirmDelete(job.id)}
                          disabled={isPending}
                        >
                          Yes
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[10px] hover:bg-white/10"
                          onClick={() => setDeletingId(null)}
                          disabled={isPending}
                        >
                          No
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10"
                          onClick={() => setEditingJob(job)}
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(job.id)}
                          className="theme-danger-control h-8 w-8 border"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modals */}
      <JobFormModal
        open={isAddModalOpen}
        onClose={handleAddClose}
        onSaved={handleJobSaved}
      />
      {editingJob && (
        <JobFormModal
          job={editingJob}
          open={true}
          onClose={handleEditClose}
          onSaved={handleJobSaved}
        />
      )}
      {viewingJob && (
        <JobDetailsModal
          job={viewingJob}
          onClose={() => setViewingJob(null)}
          onEdit={() => {
            setViewingJob(null);
            setEditingJob(viewingJob);
          }}
        />
      )}
    </>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
        {label}
      </p>
      <div className="mt-2 text-sm font-medium text-white">{value}</div>
    </div>
  );
}

function JobDetailsModal({
  job,
  onClose,
  onEdit,
}: {
  job: Job;
  onClose: () => void;
  onEdit: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="theme-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="glass-panel organic-rise-in relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 shadow-2xl shadow-black/60"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-details-title"
      >
        <div className="theme-ambient-primary pointer-events-none absolute inset-0 rounded-full blur-[90px]" />

        <div className="relative z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-black/20 px-6 py-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="theme-accent-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2
                  id="job-details-title"
                  className="truncate text-xl font-bold tracking-tight text-white"
                >
                  {job.job_title}
                </h2>
                <p className="mt-1 truncate text-sm font-medium text-zinc-400">
                  {job.company_name}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative z-10 overflow-y-auto p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DetailField
              label="Company"
              value={
                <span className="inline-flex min-w-0 items-center gap-2">
                  <Building2 className="h-4 w-4 shrink-0 text-zinc-500" />
                  <span className="truncate">{job.company_name}</span>
                </span>
              }
            />
            <DetailField
              label="Experience"
              value={job.experience_required || "N/A"}
            />
            <DetailField
              label="Date Applied"
              value={
                <span className="inline-flex items-center gap-2" suppressHydrationWarning>
                  <CalendarDays className="h-4 w-4 text-zinc-500" />
                  {formatJobDate(job.date_applied)}
                </span>
              }
            />
            <DetailField label="Status" value={<StatusBadge status={job.status} />} />
          </div>

          <div className="mt-4 grid gap-4">
            <DetailField
              label="Job Link"
              value={
                job.job_link ? (
                  <a
                    href={job.job_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-full items-center gap-2 text-[var(--accent)] transition-colors hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4 shrink-0" />
                    <span className="truncate">{job.job_link}</span>
                  </a>
                ) : (
                  "N/A"
                )
              }
            />
          </div>

          <section className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-zinc-500" />
              <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
                Attached Notes
              </h3>
            </div>
            <div className="max-h-[42vh] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-zinc-200">
                {job.notes || "No notes attached to this application."}
              </p>
            </div>
          </section>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <DetailField
              label="Created"
              value={
                <span className="inline-flex items-center gap-2" suppressHydrationWarning>
                  <Clock className="h-4 w-4 text-zinc-500" />
                  {formatJobDateTime(job.created_at)}
                </span>
              }
            />
            <DetailField
              label="Last Updated"
              value={
                <span className="inline-flex items-center gap-2" suppressHydrationWarning>
                  <Clock className="h-4 w-4 text-zinc-500" />
                  {formatJobDateTime(job.updated_at)}
                </span>
              }
            />
          </div>
        </div>

        <div className="relative z-10 flex flex-col gap-3 border-t border-white/10 bg-black/20 px-6 py-4 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            onClick={onClose}
            className="h-10 transition-all"
          >
            Close
          </Button>
          <Button
            onClick={onEdit}
            className="h-10 gap-2 transition-all"
          >
            <Pencil className="h-4 w-4" />
            Edit application
          </Button>
        </div>
      </div>
    </div>
  );
}
