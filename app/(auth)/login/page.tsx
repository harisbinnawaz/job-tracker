import Link from "next/link";
import { login } from "../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BriefcaseBusiness, ArrowRight } from "lucide-react";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-4">
      <div className="w-full max-w-sm relative">
        {/* Glow behind the card */}
        <div className="absolute inset-0 bg-violet-600/20 blur-[100px] rounded-full pointer-events-none" />
        
        {/* Header */}
        <div className="mb-6 text-center relative z-10">
          <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-500/20 to-fuchsia-500/20 p-3.5 border border-white/10 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            <BriefcaseBusiness className="h-7 w-7 text-violet-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Welcome back
          </h1>
          <p className="text-sm text-zinc-400">
            Sign in to your account to continue.
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl relative z-10">
          {error && (
            <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200 backdrop-blur-md">
              {decodeURIComponent(error)}
            </div>
          )}

          <form action={login} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="bg-black/50 border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20 h-11 transition-all"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-300">Password</Label>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="bg-black/50 border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20 h-11 transition-all"
              />
            </div>
            <Button type="submit" className="mt-4 w-full h-11 bg-zinc-100 hover:bg-white text-zinc-900 font-medium tracking-wide transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] group">
              Sign in
              <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-400 relative z-10">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-violet-400 hover:text-violet-300 hover:underline underline-offset-4 transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
