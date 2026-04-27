import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";
import { Suspense } from "react";
import { SignupForm } from "./form";

function SignupFormFallback() {
  return (
    <div className="space-y-4">
      <div className="h-11 rounded-md bg-white/5 animate-pulse border border-white/5" />
      <div className="h-11 rounded-md bg-white/5 animate-pulse border border-white/5" />
      <div className="h-11 rounded-md bg-white/5 animate-pulse border border-white/5" />
      <div className="h-11 rounded-md bg-white/5 animate-pulse border border-white/5" />
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-4">
      <div className="w-full max-w-sm relative">
        {/* Glow behind the card */}
        <div className="absolute inset-0 bg-fuchsia-600/20 blur-[100px] rounded-full pointer-events-none" />
        
        {/* Header */}
        <div className="mb-6 text-center relative z-10">
          <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-gradient-to-tr from-fuchsia-500/20 to-violet-500/20 p-3.5 border border-white/10 shadow-[0_0_30px_rgba(217,70,239,0.3)]">
            <BriefcaseBusiness className="h-7 w-7 text-fuchsia-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Create an account
          </h1>
          <p className="text-sm text-zinc-400">
            Start tracking your applications.
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl relative z-10">
          <Suspense fallback={<SignupFormFallback />}>
            <SignupForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-400 relative z-10">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-fuchsia-400 hover:text-fuchsia-300 hover:underline underline-offset-4 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
