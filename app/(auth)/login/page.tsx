import Link from "next/link";
import { login } from "../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BriefcaseBusiness } from "lucide-react";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-zinc-800 p-3">
            <BriefcaseBusiness className="h-6 w-6 text-zinc-300" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Sign in to your account to continue.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
          {error && (
            <div className="mb-4 rounded-md border border-red-900 bg-red-950/30 px-3 py-2 text-sm text-red-400">
              {decodeURIComponent(error)}
            </div>
          )}

          <form action={login} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="mt-2 w-full">
              Sign in
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-zinc-400">
          No account?{" "}
          <Link
            href="/signup"
            className="font-medium text-zinc-300 underline underline-offset-4 hover:text-zinc-100"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
