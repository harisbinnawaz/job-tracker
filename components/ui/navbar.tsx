import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { BriefcaseBusiness } from "lucide-react";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import type { VerifiedUser } from "@/lib/supabase/server";

interface NavbarProps {
  user?: VerifiedUser | null;
}

export function Navbar({ user }: NavbarProps) {

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b-0">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between">
        <Link
          href={user ? "/dashboard" : "/"}
          className="flex items-center gap-2.5 text-[var(--foreground)] font-medium tracking-tight group hover:opacity-80 transition-opacity"
        >
          <div className="theme-primary p-1.5 rounded-lg">
            <BriefcaseBusiness className="h-4 w-4 text-white" />
          </div>
          <span className="text-[15px] font-semibold tracking-wide">JobTracker</span>
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:justify-end">
          {user && <ThemeSwitcher className="w-full sm:w-auto" />}
          {user && (
            <span className="hidden text-[13px] font-medium text-[var(--muted)] bg-[var(--surface-muted)] px-3 py-1.5 rounded-full border border-[var(--border)] lg:block">
              {user.email}
            </span>
          )}
          {user && <LogoutButton />}
        </div>
      </div>
    </header>
  );
}
