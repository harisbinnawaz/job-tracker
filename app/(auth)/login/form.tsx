"use client";

import { useFormStatus } from "react-dom";
import { login } from "../actions";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/password-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowRight, LoaderCircle } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="group mt-4 h-11 w-full bg-zinc-100 font-medium tracking-wide text-zinc-900 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 hover:bg-white hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] disabled:opacity-80"
    >
      {pending ? "Signing in" : "Sign in"}
      {pending ? (
        <LoaderCircle className="ml-2 h-4 w-4 animate-spin opacity-70" />
      ) : (
        <ArrowRight className="ml-2 h-4 w-4 opacity-70 transition-transform group-hover:translate-x-1" />
      )}
    </Button>
  );
}

interface LoginFormProps {
  email?: string;
}

export function LoginForm({ email }: LoginFormProps) {
  return (
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
          defaultValue={email}
          className="h-11 border-white/10 bg-black/50 transition-all focus:border-violet-500/50 focus:ring-violet-500/20"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-zinc-300">
          Password
        </Label>
        <PasswordInput
          id="password"
          name="password"
          placeholder="Password"
          required
          autoComplete="current-password"
          className="h-11 border-white/10 bg-black/50 transition-all focus:border-violet-500/50 focus:ring-violet-500/20"
        />
      </div>
      <SubmitButton />
    </form>
  );
}
