"use client";

import { signup } from "../actions";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/password-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight } from "lucide-react";

function isNextRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  if (!/[a-zA-Z]/.test(password)) {
    return "Password must contain at least one letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  return null;
}

export function SignupForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordMismatch(false);
    setPasswordError(false);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm-password") as string;

    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      return;
    }

    const validationError = validatePassword(password);
    if (validationError) {
      setPasswordError(true);
      return;
    }

    formData.delete("confirm-password");

    startTransition(async () => {
      try {
        await signup(formData);
      } catch (err) {
        if (isNextRedirectError(err)) throw err;
        console.error("Signup error:", err);
      }
    });
  };

  return (
    <>
      {(error || passwordMismatch || passwordError) && (
        <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200 backdrop-blur-md">
          {passwordMismatch
            ? "Passwords do not match"
            : passwordError
            ? "Password must be at least 8 characters and contain both letters and numbers"
            : decodeURIComponent(error || "")}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
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
            className="h-11 border-white/10 bg-black/50 transition-all focus:border-fuchsia-500/50 focus:ring-fuchsia-500/20"
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
            autoComplete="new-password"
            className="h-11 border-white/10 bg-black/50 transition-all focus:border-fuchsia-500/50 focus:ring-fuchsia-500/20"
          />
          <p className="text-xs leading-5 text-zinc-500">
            Use at least 8 characters with letters and numbers.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-zinc-300">
            Confirm Password
          </Label>
          <PasswordInput
            id="confirm-password"
            name="confirm-password"
            placeholder="Password"
            required
            autoComplete="new-password"
            className="h-11 border-white/10 bg-black/50 transition-all focus:border-fuchsia-500/50 focus:ring-fuchsia-500/20"
          />
        </div>
        <Button
          type="submit"
          className="group mt-4 h-11 w-full bg-zinc-100 font-medium tracking-wide text-zinc-900 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 hover:bg-white hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
          disabled={isPending}
        >
          {isPending ? "Creating account..." : "Create account"}
          {!isPending && (
            <ArrowRight className="ml-2 h-4 w-4 opacity-70 transition-transform group-hover:translate-x-1" />
          )}
        </Button>
      </form>
    </>
  );
}
