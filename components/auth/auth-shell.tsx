"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BriefcaseBusiness } from "lucide-react";

export default function AuthShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSignup = pathname === "/signup";

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-2 sm:p-4">
      {/* 
        Master Container:
        - Wider (max-w-5xl) and shorter (md:h-[480px])
        - Hidden overflow for clean clipping
      */}
      <div className="relative flex w-full max-w-5xl min-h-[440px] md:h-[480px] overflow-hidden rounded-3xl border border-(--border) bg-(--surface) shadow-[0_20px_80px_-36px_rgba(15,23,42,0.35)] flex-col md:flex-row">
        
        {/* Form Pane (Left initially, slides Right on Signup) */}
        <div
          className={cn(
            "relative z-10 flex h-full w-full md:w-1/2 md:absolute md:inset-y-0 md:left-0 items-center justify-center bg-(--surface) p-4 md:p-5 transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform",
            isSignup ? "md:translate-x-full" : "md:translate-x-0"
          )}
        >
          {/* Mobile Logo Header (Hidden on Desktop) */}
          <div className="absolute top-4 left-4 flex md:hidden items-center gap-1.5">
            <BriefcaseBusiness className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-bold tracking-tight text-(--foreground)">Job Tracker</span>
          </div>

          <div className="flex h-full w-full max-w-sm flex-col justify-center">{children}</div>
        </div>

        {/* 
          Feature Pane (Right initially, slides Left on Signup)
          - Hidden on mobile to keep the focus strictly on the auth form
        */}
        <div
          className={cn(
            "relative hidden md:flex h-full w-full md:w-1/2 md:absolute md:inset-y-0 md:right-0 items-center justify-center border-t border-(--border) bg-(--surface-hover) p-6 transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform md:border-t-0",
            isSignup ? "md:-translate-x-full md:border-r" : "md:translate-x-0 md:border-l"
          )}
        >
          {/* Desktop Logo Header */}
          <div className="absolute top-6 left-6 flex items-center gap-1.5">
            <BriefcaseBusiness className="h-4 w-4 text-violet-400" />
            <span className="text-base font-bold tracking-tight text-(--foreground)">Job Tracker</span>
          </div>

          <div className="flex w-full max-w-[340px] flex-col gap-4">
            <div className="space-y-1">
              <p className="text-[9px] font-medium uppercase tracking-widest text-(--muted)">
                Your career, organized
              </p>
              <h2 className="text-xl font-semibold leading-tight text-(--foreground)">
                Stay ahead of every opportunity.
              </h2>
              <p className="text-xs text-(--muted) leading-relaxed">
                Centralize and track your job applications with clarity, consistency, and speed.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="rounded-xl border border-(--border) bg-(--surface) p-3 shadow-sm">
                <p className="text-xs font-medium text-(--foreground)">
                  Centralized Tracking
                </p>
                <p className="mt-1 text-[11px] text-(--muted) leading-relaxed">
                  Save and manage all your job application information in one unified hub.
                </p>
              </div>
              <div className="rounded-xl border border-(--border) bg-(--surface) p-3 shadow-sm">
                <p className="text-xs font-medium text-(--foreground)">
                  Streamlined Workflow
                </p>
                <p className="mt-1 text-[11px] text-(--muted) leading-relaxed">
                  Keep track of statuses, dates, and notes seamlessly.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
