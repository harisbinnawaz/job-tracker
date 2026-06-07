"use client";

import { logout } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { LoaderCircle, LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";

function SignOutProcessingDialog() {
  return (
    <div
      className="signout-overlay fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md"
      role="status"
      aria-live="polite"
      aria-label="Signing out"
    >
      <div className="signout-dialog organic-rise-in w-full max-w-sm rounded-xl p-6 text-center shadow-2xl">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--accent-soft)] text-[var(--accent)] shadow-[0_0_32px_var(--accent-glow)]">
          <LoaderCircle className="size-6 animate-spin" aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-base font-semibold text-[var(--foreground)]">
          Signing you out
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Securing your session and returning you to the login screen.
        </p>
        <div className="signout-progress mt-5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
          <span className="block h-full rounded-full bg-[var(--accent)]" />
        </div>
      </div>
    </div>
  );
}

function LogoutSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <>
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        aria-label={pending ? "Signing out" : "Sign out"}
        title={pending ? "Signing out" : "Sign out"}
        disabled={pending}
      >
        {pending ? (
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <LogOut className="h-4 w-4" aria-hidden="true" />
        )}
      </Button>
      {pending && <SignOutProcessingDialog />}
    </>
  );
}

export function LogoutButton() {
  return (
    <form action={logout}>
      <LogoutSubmitButton />
    </form>
  );
}
