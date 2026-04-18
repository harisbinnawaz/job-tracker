import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { createClient } from "@/lib/supabase/server";
import { BriefcaseBusiness } from "lucide-react";

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo / Brand */}
        <Link
          href={user ? "/dashboard" : "/"}
          className="flex items-center gap-2 text-zinc-100 font-semibold text-sm tracking-tight"
        >
          <BriefcaseBusiness className="h-4 w-4" />
          <span>JobTracker</span>
        </Link>

        {/* Right-side controls */}
        <div className="flex items-center gap-1">
          {user && (
            <span className="hidden sm:block text-xs text-zinc-400 mr-3">
              {user.email}
            </span>
          )}
          {user && <LogoutButton />}
        </div>
      </div>
    </header>
  );
}
