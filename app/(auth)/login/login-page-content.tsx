"use client";

import { useSearchParams } from "next/navigation";
import { LoginForm } from "./form";

export default function LoginPageContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");
  const email = searchParams.get("email");

  return (
    <>
      {message && (
        <div className="theme-alert-success mb-6 rounded-lg border px-4 py-3 text-sm backdrop-blur-md">
          {decodeURIComponent(message)}
        </div>
      )}

      {error && (
        <div className="theme-alert-danger mb-6 rounded-lg border px-4 py-3 text-sm backdrop-blur-md">
          {decodeURIComponent(error)}
        </div>
      )}

      <LoginForm
        key={`${error}-${email}`}
        email={email ? decodeURIComponent(email) : undefined}
      />
    </>
  );
}
