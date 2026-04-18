import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";
import { Suspense } from "react";
import { SignupForm } from "./form";

function SignupFormFallback() {
  return (
    <div className="space-y-4">
      <div className="h-9 rounded-md bg-zinc-700 animate-pulse" />
      <div className="h-9 rounded-md bg-zinc-700 animate-pulse" />
      <div className="h-9 rounded-md bg-zinc-700 animate-pulse" />
      <div className="h-9 rounded-md bg-zinc-700 animate-pulse" />
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-zinc-800 p-3">
            <BriefcaseBusiness className="h-6 w-6 text-zinc-300" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
            Create an account
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Start tracking your applications.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
          <Suspense fallback={<SignupFormFallback />}>
            <SignupForm />
          </Suspense>
        </div>

        <p className="mt-4 text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-zinc-300 underline underline-offset-4 hover:text-zinc-100"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
