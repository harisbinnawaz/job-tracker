import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";
import { LoginForm } from "./form";

export const dynamic = "force-dynamic";

interface LoginPageProps {
  searchParams: Promise<{ error?: string; message?: string; email?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, message, email } = await searchParams;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-stretch">
      <header className="mb-6 flex w-full flex-col items-center text-center">
        <div className="mb-4 flex w-full justify-center">
          <div className="flex size-[3.25rem] shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-tr from-violet-500/20 to-fuchsia-500/20 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            <BriefcaseBusiness className="h-7 w-7 text-violet-400" />
          </div>
        </div>
        <h1 className="mb-2 w-full text-3xl font-bold tracking-tight text-white">
          Welcome back
        </h1>
        <p className="w-full text-sm text-zinc-400">
          Sign in to your account to continue.
        </p>
      </header>

      <div className="glass-panel organic-rise-in w-full rounded-2xl p-6 sm:p-8">
        {message && (
          <div className="mb-6 rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-200 backdrop-blur-md">
            {decodeURIComponent(message)}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200 backdrop-blur-md">
            {decodeURIComponent(error)}
          </div>
        )}

        <LoginForm email={email ? decodeURIComponent(email) : undefined} />
      </div>

      <p className="mt-5 w-full text-center text-sm text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-violet-400 underline-offset-4 transition-colors hover:text-violet-300 hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
