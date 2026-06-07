import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";
import { Suspense } from "react";
import LoginPageContent from "./login-page-content";

export const dynamic = "force-static";

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-[340px] flex-col items-center justify-center space-y-4">
      <header className="flex w-full flex-col items-center text-center space-y-1.5">
        <div className="theme-accent-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border">
          <BriefcaseBusiness className="h-4 w-4" />
        </div>
        <div className="space-y-0.5">
          <h1 className="text-lg font-medium tracking-tight text-white">
            Welcome back
          </h1>
          <p className="text-xs text-zinc-400">
            Sign in to your account to continue.
          </p>
        </div>
      </header>

      <div className="glass-panel organic-rise-in w-full rounded-2xl p-4 space-y-3">
        <Suspense fallback={<div />}>
          <LoginPageContent />
        </Suspense>

        <div className="text-center text-xs text-zinc-400 border-t border-white/5 pt-3">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-violet-400 underline-offset-4 transition-colors hover:text-violet-300 hover:underline"
          >
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
