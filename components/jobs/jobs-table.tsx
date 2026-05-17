"use client";

import { useState, useMemo, useEffect } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteJob } from "@/app/(dashboard)/actions";
import { JobFormModal } from "./job-form-modal";
import { StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, ExternalLink, Search, ArrowUpDown, Inbox } from "lucide-react";
import { format, parseISO } from "date-fns";
import { JOB_STATUSES, type Job, type JobStatus } from "@/lib/types";

interface JobsTableProps {
  initialJobs: Job[];
}

const metricStyles: Record<JobStatus, string> = {
  Applied: "from-blue-500/15 to-blue-500/5 text-blue-200 border-blue-400/20",
  Interviewing: "from-amber-500/15 to-amber-500/5 text-amber-200 border-amber-400/20",
  Interviewed: "from-cyan-500/15 to-cyan-500/5 text-cyan-200 border-cyan-400/20",
  Offer: "from-emerald-500/15 to-emerald-500/5 text-emerald-200 border-emerald-400/20",
  Rejected: "from-zinc-500/15 to-zinc-500/5 text-zinc-200 border-zinc-400/20",
};

export function JobsTable({ initialJobs }: JobsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "All">("All");
  const [experienceFilter, setExperienceFilter] = useState<string | "All">("All");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [editingJob, setEditingJob] = useState<Job | null>(null);
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

  if (jobs.length === 0) {
    return (
      <>
        <div className="text-center py-16 glass-panel rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-violet-600/10 blur-[100px] pointer-events-none" />
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
              className="bg-white text-zinc-900 hover:bg-zinc-200 font-medium tracking-wide shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all"
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
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
          className="bg-violet-600 hover:bg-violet-500 text-white font-medium tracking-wide shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] transition-all border border-violet-500/50"
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
            className="pl-9 bg-black/40 border-transparent focus:border-violet-500/50 h-10 transition-all rounded-lg"
            placeholder="Search company or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={experienceFilter}
          onChange={(e) => setExperienceFilter(e.target.value)}
          className="h-10 rounded-lg border border-transparent bg-black/40 px-3 text-sm text-zinc-200 transition-all focus:border-violet-500/50 outline-none"
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
          className="h-10 rounded-lg border border-transparent bg-black/40 px-3 text-sm text-zinc-200 transition-all focus:border-violet-500/50 outline-none"
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
          className="h-10 gap-2 bg-black/40 border-transparent hover:bg-black/60 hover:border-white/10 transition-all rounded-lg"
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
        <div className="overflow-x-auto rounded-2xl glass-panel">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-black/40">
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  Company
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  Role
                </th>
                <th className="hidden px-5 py-4 text-xs font-semibold uppercase tracking-widest text-zinc-400 md:table-cell">
                  Experience
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  Date Applied
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  Status
                </th>
                <th className="hidden px-5 py-4 text-xs font-semibold uppercase tracking-widest text-zinc-400 sm:table-cell">
                  Link
                </th>
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredJobs.map((job, index) => (
                <tr
                  key={job.id}
                  className="organic-rise-row group transition-colors hover:bg-white/5"
                  style={{ animationDelay: `${Math.min(index * 42, 260)}ms` }}
                >
                  <td className="px-5 py-4 text-sm font-medium text-white">
                    {job.company_name}
                  </td>
                  <td className="px-5 py-4 text-sm text-zinc-300">
                    {job.job_title}
                  </td>
                  <td className="hidden px-5 py-4 text-sm text-zinc-400 md:table-cell">
                    {job.experience_required}
                  </td>
                  <td className="px-5 py-4 text-sm text-zinc-400">
                    {job.date_applied ? (
                      <span suppressHydrationWarning>
                        {(() => {
                          try {
                            const parsed = parseISO(job.date_applied);
                            return isNaN(parsed.getTime()) ? "Invalid Date" : format(parsed, "MMM d, yyyy");
                          } catch (e) {
                            return "Invalid Date";
                          }
                        })()}
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="hidden px-5 py-4 text-sm sm:table-cell">
                    {job.job_link ? (
                      <a
                        href={job.job_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
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
                          className="h-8 w-8 border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/15 hover:text-red-200"
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
    </>
  );
}
