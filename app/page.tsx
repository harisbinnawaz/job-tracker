import { redirect } from "next/navigation";
import { getVerifiedUser } from "@/lib/supabase/server";

export default async function RootPage() {
  const user = await getVerifiedUser();

  if (user) redirect("/dashboard");
  redirect("/login");
}
