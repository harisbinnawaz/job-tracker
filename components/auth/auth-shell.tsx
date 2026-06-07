"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AuthShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSignup = pathname === "/signup";

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-4 sm:p-8">
      <div className="relative flex w-full max-w-4xl min-h-[600px] md:h-[600px] overflow-hidden rounded-3xl border border-(--border) bg-(--surface) shadow-[0_20px_80px_-36px_rgba(15,23,42,0.35)] flex-col md:flex-row">
        
        {/* Form Pane (Left initially, slides Right on Signup) */}
        <div
          className={cn(
            "relative z-10 flex h-full w-full md:w-1/2 md:absolute md:inset-y-0 md:left-0 items-center justify-center bg-(--surface) p-6 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
            isSignup ? "md:translate-x-full" : "md:translate-x-0"
          )}
        >
          <div className="flex h-full w-full max-w-sm flex-col justify-center">{children}</div>
        </div>

        {/* Feature Pane (Right initially, slides Left on Signup) */}
        <div
          className={cn(
            "relative flex h-full w-full md:w-1/2 md:absolute md:inset-y-0 md:right-0 items-center justify-center border-t border-(--border) bg-(--surface-hover) p-8 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform md:border-t-0",
            isSignup ? "md:-translate-x-full md:border-r" : "md:translate-x-0 md:border-l"
          )}
        >
          <div className="flex w-full max-w-[320px] flex-col gap-6">
            <div className="space-y-1.5">
              <p className="text-[10px] font-medium uppercase tracking-widest text-(--muted)">
                Your career, organized
              </p>
              <h2 className="text-xl font-semibold leading-tight text-(--foreground)">
                Stay ahead of every opportunity.
              </h2>
              <p className="text-sm text-(--muted) leading-relaxed">
                Centralize and track your job applications with clarity, consistency, and speed.
              </p>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-sm">
                <p className="text-sm font-medium text-(--foreground)">
                  Centralized Tracking
                </p>
                <p className="mt-1 text-xs text-(--muted) leading-relaxed">
                  Save and manage all your job application information in one unified hub.
                </p>
              </div>
              <div className="rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-sm">
                <p className="text-sm font-medium text-(--foreground)">
                  Streamlined Workflow
                </p>
                <p className="mt-1 text-xs text-(--muted) leading-relaxed">
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
