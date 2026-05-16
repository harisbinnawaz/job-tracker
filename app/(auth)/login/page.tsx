import Link from "next/link";
import { login } from "../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BriefcaseBusiness, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface LoginPageProps {
  searchParams: Promise<{ error?: string; message?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, message } = await searchParams;

  return (
    <div className="relative mx-auto flex w-full max-w-sm flex-col items-center">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-violet-600/20 blur-[100px]"
      />

      <div className="mb-5 w-full text-center">
        <div className="mb-4 inline-flex items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-tr from-violet-500/20 to-fuchsia-500/20 p-3.5 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
          <BriefcaseBusiness className="h-7 w-7 text-violet-400" />
        </div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">
          Welcome back
        </h1>
        <p className="text-sm text-zinc-400">
          Sign in to your account to continue.
        </p>
      </div>

      <div className="glass-panel relative z-10 w-full rounded-2xl p-6 sm:p-8">
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

        <form action={login} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="h-11 border-white/10 bg-black/50 transition-all focus:border-violet-500/50 focus:ring-violet-500/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-300">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="h-11 border-white/10 bg-black/50 transition-all focus:border-violet-500/50 focus:ring-violet-500/20"
            />
          </div>
          <Button
            type="submit"
            className="group mt-4 h-11 w-full bg-zinc-100 font-medium tracking-wide text-zinc-900 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 hover:bg-white hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
          >
            Sign in
            <ArrowRight className="ml-2 h-4 w-4 opacity-70 transition-transform group-hover:translate-x-1" />
          </Button>
        </form>
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
