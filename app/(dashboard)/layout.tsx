import { Navbar } from "@/components/ui/navbar";
import { getVerifiedUser } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getVerifiedUser();

  return (
    <>
      <Navbar user={user} />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">{children}</main>
    </>
  );
}
