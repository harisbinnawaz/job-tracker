"use client";

import Link from "next/link";
import { signup } from "../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function SignupForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [passwordMismatch, setPasswordMismatch] = useState(false);

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

    const signup_action = (await import("../actions")).signup;
    await signup_action(formData);
  };

  return (
    <>
      {(error || passwordMismatch) && (
        <div className="mb-4 rounded-md border border-red-900 bg-red-950/30 px-3 py-2 text-sm text-red-400">
          {passwordMismatch
            ? "Passwords do not match"
            : decodeURIComponent(error || "")}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            name="confirm-password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>
        <Button type="submit" className="mt-2 w-full">
          Create account
        </Button>
      </form>
    </>
  );
}
