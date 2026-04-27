"use client";

import { signup } from "../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight } from "lucide-react";

export function SignupForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordMismatch(false);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm-password") as string;

    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      return;
    }

    // Remove confirm-password before sending to server action
    formData.delete("confirm-password");

    startTransition(async () => {
      try {
        await signup(formData);
      } catch (err) {
        console.error("Signup error:", err);
      }
    });
  };

  return (
    <>
      {message && (
        <div className="mb-6 rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-200 backdrop-blur-md">
          {decodeURIComponent(message)}
        </div>
      )}

      {(error || passwordMismatch) && (
        <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200 backdrop-blur-md">
          {passwordMismatch
            ? "Passwords do not match"
            : decodeURIComponent(error || "")}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="bg-black/50 border-white/10 focus:border-fuchsia-500/50 focus:ring-fuchsia-500/20 h-11 transition-all"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-zinc-300">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="new-password"
            className="bg-black/50 border-white/10 focus:border-fuchsia-500/50 focus:ring-fuchsia-500/20 h-11 transition-all"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-zinc-300">Confirm Password</Label>
          <Input
            id="confirm-password"
            name="confirm-password"
            type="password"
            placeholder="••••••••"
            required
            className="bg-black/50 border-white/10 focus:border-fuchsia-500/50 focus:ring-fuchsia-500/20 h-11 transition-all"
          />
        </div>
        <Button 
          type="submit" 
          className="mt-4 w-full h-11 bg-zinc-100 hover:bg-white text-zinc-900 font-medium tracking-wide transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] group" 
          disabled={isPending}
        >
          {isPending ? "Creating account..." : "Create account"}
          {!isPending && <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />}
        </Button>
      </form>
    </>
  );
}
