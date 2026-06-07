import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";
import { Suspense } from "react";
import { SignupForm } from "./form";

export const dynamic = "force-static";

function SignupFormFallback() {
  return (
    <div className="space-y-3">
      <div className="theme-skeleton h-10 animate-pulse rounded-md border border-(--border)" />
      <div className="theme-skeleton h-10 animate-pulse rounded-md border border-(--border)" />
      <div className="theme-skeleton h-10 animate-pulse rounded-md border border-(--border)" />
      <div className="theme-skeleton h-10 animate-pulse rounded-md border border-(--border)" />
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="mx-auto flex w-full max-w-[340px] flex-col items-center justify-center space-y-6">
      <header className="flex w-full flex-col items-center text-center space-y-2">
        <div className="theme-accent-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border">
          <BriefcaseBusiness className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-medium tracking-tight text-white">
            Create an account
          </h1>
          <p className="text-sm text-zinc-400">
            Start tracking your applications.
          </p>
        </div>
      </header>

      <div className="glass-panel organic-rise-in w-full rounded-2xl p-5 space-y-5">
        <Suspense fallback={<SignupFormFallback />}>
          <SignupForm />
        </Suspense>

        <div className="text-center text-sm text-zinc-400 border-t border-white/5 pt-4">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-fuchsia-400 underline-offset-4 transition-colors hover:text-fuchsia-300 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
