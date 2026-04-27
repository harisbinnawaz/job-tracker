import { getJobs } from "../actions";
import JobsTableShell from "@/components/jobs/jobs-table-shell";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const jobs = await getJobs();

    return <JobsTableShell initialJobs={jobs ?? []} />;
  } catch (error) {
    console.error("Dashboard page error:", error);
    return <JobsTableShell initialJobs={[]} />;
  }
}
