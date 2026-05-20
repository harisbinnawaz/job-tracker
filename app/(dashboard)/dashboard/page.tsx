import { getJobs } from "../actions";
import JobsTableShell from "@/components/jobs/jobs-table-shell";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Job } from "@/lib/types";

export const dynamic = "force-dynamic";

function isNextRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export default async function DashboardPage() {
  let jobs: Job[] = [];

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    jobs = await getJobs();
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error;
    }
    console.error("Dashboard page error:", error);
  }

  return <JobsTableShell initialJobs={jobs ?? []} />;
}
