import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { createClient } from "@/lib/supabase/server";
import { BriefcaseBusiness } from "lucide-react";

export async function Navbar() {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user;
  } catch (error) {
    console.error("Navbar error:", error);
    // Continue without user info
  }

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b-0 border-white/5 bg-black/40">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo / Brand */}
        <Link
          href={user ? "/dashboard" : "/"}
          className="flex items-center gap-2.5 text-zinc-100 font-medium tracking-tight group hover:opacity-80 transition-opacity"
        >
          <div className="bg-gradient-to-tr from-violet-500 to-fuchsia-500 p-1.5 rounded-lg shadow-[0_0_15px_rgba(139,92,246,0.5)]">
            <BriefcaseBusiness className="h-4 w-4 text-white" />
          </div>
          <span className="text-[15px] font-semibold tracking-wide">JobTracker</span>
        </Link>

        {/* Right-side controls */}
        <div className="flex items-center gap-4">
          {user && (
            <span className="hidden sm:block text-[13px] font-medium text-zinc-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              {user.email}
            </span>
          )}
          {user && <LogoutButton />}
        </div>
      </div>
    </header>
  );
}
