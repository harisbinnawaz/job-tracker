import { getJobs } from "../actions";
import JobsTableShell from "@/components/jobs/jobs-table-shell";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const jobs = await getJobs();

    return <JobsTableShell initialJobs={jobs ?? []} />;
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error && typeof (error as any).digest === 'string' && (error as any).digest.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error("Dashboard page error:", error);
    return <JobsTableShell initialJobs={[]} />;
  }
}
