"use client";

import { useState, useMemo } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteJob } from "@/app/(dashboard)/actions";
import { JobFormModal } from "./job-form-modal";
import { StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, ExternalLink, Search, ArrowUpDown, Inbox } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { Job, JobStatus } from "@/lib/types";

interface JobsTableProps {
  initialJobs: Job[];
}

export function JobsTable({ initialJobs }: JobsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "All">("All");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    if (statusFilter !== "All") {
      result = result.filter((job) => job.status === statusFilter);
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (job) =>
          job.company_name.toLowerCase().includes(q) ||
          job.job_title.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const dateA = parseISO(a.date_applied);
      const dateB = parseISO(b.date_applied);
      return sortOrder === "desc"
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });

    return result;
  }, [jobs, searchQuery, statusFilter, sortOrder]);

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

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <Inbox className="h-12 w-12 mx-auto text-zinc-400 mb-4" />
        <h2 className="text-lg font-semibold text-zinc-100 mb-1">
          No applications yet
        </h2>
        <p className="text-sm text-zinc-400 mb-6">
          Add your first job application to get started.
        </p>
        <Button onClick={() => setIsAddModalOpen(true)}>Add Application</Button>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">
            Applications
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Showing {filteredJobs.length} of {jobs.length} application
            {jobs.length !== 1 ? "s" : ""}
            {statusFilter !== "All" && ` · ${statusFilter}`}
            {searchQuery && ` · "${searchQuery}"`}
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>Add Application</Button>
      </div>

      {/* Filter Bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 min-w-48">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <Input
            className="pl-9"
            placeholder="Search company or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as JobStatus | "All")}
          className="h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 transition-colors"
        >
          <option value="All">All statuses</option>
          <option value="Applied">Applied</option>
          <option value="Interviewing">Interviewing</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setSortOrder((o) => (o === "desc" ? "asc" : "desc"))}
          className="gap-1.5"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          {sortOrder === "desc" ? "Newest first" : "Oldest first"}
        </Button>
      </div>

      {/* Table */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-8">
          <Inbox className="h-8 w-8 mx-auto text-zinc-400 mb-2" />
          <p className="text-sm font-medium text-zinc-100 mb-1">
            No results found
          </p>
          <p className="text-xs text-zinc-400 mb-4">
            Try adjusting your search or filter.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("All");
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Date Applied
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Status
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 sm:table-cell">
                  Link
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-b border-zinc-800/60 hover:bg-zinc-800/50"
                >
                  <td className="px-4 py-3 text-sm font-medium text-zinc-100">
                    {job.company_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400">
                    {job.job_title}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400">
                    {format(parseISO(job.date_applied), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="hidden px-4 py-3 text-sm sm:table-cell">
                    {job.job_link ? (
                      <a
                        href={job.job_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-400 hover:text-zinc-100"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {deletingId === job.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-zinc-500">Delete?</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleConfirmDelete(job.id)}
                          disabled={isPending}
                        >
                          Yes
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
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
                          onClick={() => setEditingJob(job)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(job.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
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
      />
      {editingJob && (
        <JobFormModal
          job={editingJob}
          open={true}
          onClose={handleEditClose}
        />
      )}
    </>
  );
}
