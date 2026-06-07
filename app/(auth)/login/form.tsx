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
      className="group mt-4 h-11 w-full font-medium tracking-wide transition-all duration-300 disabled:opacity-80"
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
        <Label htmlFor="email" className="form-label">
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
          className="h-11 transition-all"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="form-label">
          Password
        </Label>
        <PasswordInput
          id="password"
          name="password"
          placeholder="Password"
          required
          autoComplete="current-password"
          className="h-11 transition-all"
        />
      </div>
      <SubmitButton />
    </form>
  );
}
