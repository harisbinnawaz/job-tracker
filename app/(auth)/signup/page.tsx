import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";
import { Suspense } from "react";
import { SignupForm } from "./form";

export const dynamic = "force-dynamic";

function SignupFormFallback() {
  return (
    <div className="space-y-4">
      <div className="h-11 animate-pulse rounded-md border border-white/5 bg-white/5" />
      <div className="h-11 animate-pulse rounded-md border border-white/5 bg-white/5" />
      <div className="h-11 animate-pulse rounded-md border border-white/5 bg-white/5" />
      <div className="h-11 animate-pulse rounded-md border border-white/5 bg-white/5" />
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="relative mx-auto flex w-full max-w-sm flex-col items-center">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-fuchsia-600/20 blur-[100px]"
      />

      <div className="mb-5 w-full text-center">
        <div className="mb-4 inline-flex items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-tr from-fuchsia-500/20 to-violet-500/20 p-3.5 shadow-[0_0_30px_rgba(217,70,239,0.3)]">
          <BriefcaseBusiness className="h-7 w-7 text-fuchsia-400" />
        </div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">
          Create an account
        </h1>
        <p className="text-sm text-zinc-400">
          Start tracking your applications.
        </p>
      </div>

      <div className="glass-panel relative z-10 w-full rounded-2xl p-6 sm:p-8">
        <Suspense fallback={<SignupFormFallback />}>
          <SignupForm />
        </Suspense>
      </div>

      <p className="mt-5 w-full text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-fuchsia-400 underline-offset-4 transition-colors hover:text-fuchsia-300 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
