# CLAUDE.md — Job Application Tracker: AI Copilot Development Roadmap

> **Instructions for AI Copilot:** Read this document in full before writing any code. Execute each Phase sequentially. Do not skip phases or combine them. Each phase builds directly on the last. When a phase is complete, confirm before proceeding to the next.

---

## Project Overview

**Application:** Job Application Tracker  
**Stack:** Next.js 14+ (App Router) · Tailwind CSS · Supabase (PostgreSQL + Auth) · Lucide React · `next-themes`  
**Design Principle:** Clean, professional, minimalist. Muted Zinc/Slate palette. No gradients, no glows, no "AI aesthetics." Excellent typography and high contrast in both light and dark modes.

---

## Global Conventions (Follow These Throughout All Phases)

- Use **TypeScript** for every file (`.ts`, `.tsx`).
- All Server Components are `async` by default — only add `"use client"` when genuinely needed (event handlers, hooks, browser APIs).
- Use **Server Actions** (`"use server"`) for all data mutations — no separate API routes for CRUD.
- Follow the App Router file convention: `app/`, `app/layout.tsx`, `app/page.tsx`, `app/(auth)/`, `app/(dashboard)/`.
- All Supabase DB queries use **Row Level Security (RLS)** — never bypass it.
- Tailwind class order convention: layout → spacing → sizing → typography → color → border → effects.
- Components go in `components/` at the project root, co-located by domain: `components/ui/`, `components/jobs/`, `components/auth/`.
- Use `cn()` utility (from `clsx` + `tailwind-merge`) for all conditional classNames.

---

## Phase 1: Project Initialization & Dependencies

**Goal:** Scaffold the Next.js project and install all required packages.

### 1.1 — Scaffold the Project

Run the following in your terminal. Answer the prompts as specified:

```bash
npx create-next-app@latest job-tracker --typescript --tailwind --eslint --app --src-dir no --import-alias "@/*"
cd job-tracker
```

### 1.2 — Install All Dependencies

```bash
# Supabase client & Auth helpers for Next.js App Router
npm install @supabase/supabase-js @supabase/ssr

# Theming
npm install next-themes

# Icons
npm install lucide-react

# Utility: className merging (used in cn() helper)
npm install clsx tailwind-merge

# Date formatting
npm install date-fns
```

### 1.3 — Verify `package.json`

Confirm the following appear in `dependencies`:
- `@supabase/supabase-js`
- `@supabase/ssr`
- `next-themes`
- `lucide-react`
- `clsx`
- `tailwind-merge`
- `date-fns`

### 1.4 — Create the `cn()` Utility

**File: `lib/utils.ts`**

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 1.5 — Initial Folder Structure to Create

Create these empty directories now so later phases can reference them:

```
mkdir -p components/ui components/jobs components/auth lib app/\(auth\)/login app/\(auth\)/signup app/\(dashboard\)/dashboard
```

Expected top-level structure after Phase 1:

```
job-tracker/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   └── dashboard/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── auth/
│   ├── jobs/
│   └── ui/
├── lib/
│   └── utils.ts
├── public/
├── .env.local          ← create this (populated in Phase 2)
├── tailwind.config.ts
└── next.config.ts
```

---

## Phase 2: Supabase Setup

**Goal:** Configure Supabase project, create the database schema, set up environment variables, and create the Supabase client utilities.

### 2.1 — Supabase Project Setup (Manual Step — Do in Supabase Dashboard)

1. Go to [https://supabase.com](https://supabase.com) and create a new project.
2. Once provisioned, navigate to **Project Settings → API**.
3. Copy the **Project URL** and the **`anon` public key**.

### 2.2 — Environment Variables

**File: `.env.local`** (create at project root, never commit this file)

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Add `.env.local` to `.gitignore` if it isn't already present.

### 2.3 — Database Schema (Run in Supabase SQL Editor)

Navigate to **Supabase Dashboard → SQL Editor** and run the following SQL exactly:

```sql
-- Create the jobs table
CREATE TABLE jobs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  job_title   TEXT NOT NULL,
  date_applied DATE NOT NULL,
  status      TEXT NOT NULL DEFAULT 'Applied'
                CHECK (status IN ('Applied', 'Interviewing', 'Offer', 'Rejected')),
  job_link    TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast per-user queries
CREATE INDEX idx_jobs_user_id ON jobs(user_id);

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only access their own rows
CREATE POLICY "Users can view own jobs"
  ON jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs"
  ON jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs"
  ON jobs FOR DELETE
  USING (auth.uid() = user_id);
```

### 2.4 — Supabase Client Utilities

Create three Supabase client files. This is required by `@supabase/ssr` for the App Router pattern.

---

**File: `lib/supabase/client.ts`**  
(Browser-side client for Client Components)

```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

---

**File: `lib/supabase/server.ts`**  
(Server-side client for Server Components and Server Actions)

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component — safe to ignore
          }
        },
      },
    }
  );
}
```

---

**File: `lib/supabase/middleware.ts`**  
(Middleware client for session refresh)

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — do not remove this block
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect unauthenticated users away from protected routes
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") ||
                     request.nextUrl.pathname.startsWith("/signup");

  if (!user && !isAuthPage && request.nextUrl.pathname !== "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

---

**File: `middleware.ts`** (at project root)

```ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

### 2.5 — TypeScript Types for the Database

**File: `lib/types.ts`**

```ts
export type JobStatus = "Applied" | "Interviewing" | "Offer" | "Rejected";

export interface Job {
  id: string;
  user_id: string;
  company_name: string;
  job_title: string;
  date_applied: string; // ISO date string: YYYY-MM-DD
  status: JobStatus;
  job_link: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type JobInsert = Omit<Job, "id" | "user_id" | "created_at" | "updated_at">;
export type JobUpdate = Partial<JobInsert>;
```

---

## Phase 3: Theming & Global UI

**Goal:** Configure Tailwind for the design system, implement the ThemeProvider, and build the root layout with a persistent navbar.

### 3.1 — Tailwind Configuration

**File: `tailwind.config.ts`** — Replace the entire file with:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        // Design token aliases — use these throughout the app
        // Light: zinc-50 bg, zinc-900 text | Dark: zinc-950 bg, zinc-100 text
      },
    },
  },
  plugins: [],
};

export default config;
```

### 3.2 — Global CSS

**File: `app/globals.css`** — Replace entirely with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: theme(colors.zinc.50);
    --foreground: theme(colors.zinc.900);
    --surface: theme(colors.white);
    --surface-hover: theme(colors.zinc.100);
    --border: theme(colors.zinc.200);
    --muted: theme(colors.zinc.500);
    --accent: theme(colors.zinc.800);
  }

  .dark {
    --background: theme(colors.zinc.950);
    --foreground: theme(colors.zinc.100);
    --surface: theme(colors.zinc.900);
    --surface-hover: theme(colors.zinc.800);
    --border: theme(colors.zinc.800);
    --muted: theme(colors.zinc.400);
    --accent: theme(colors.zinc.200);
  }

  * {
    @apply border-zinc-200 dark:border-zinc-800;
  }

  body {
    @apply bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100;
    font-feature-settings: "rlig" 1, "calt" 1;
    -webkit-font-smoothing: antialiased;
  }

  /* Smooth focus rings — accessibility */
  :focus-visible {
    @apply outline-none ring-2 ring-zinc-900 dark:ring-zinc-100 ring-offset-2 ring-offset-zinc-50 dark:ring-offset-zinc-950;
  }
}
```

### 3.3 — ThemeProvider Component

**File: `components/ui/theme-provider.tsx`**

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

### 3.4 — Theme Toggle Button Component

**File: `components/ui/theme-toggle.tsx`**

```tsx
"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-2",
        "text-zinc-600 dark:text-zinc-400",
        "hover:bg-zinc-100 dark:hover:bg-zinc-800",
        "transition-colors duration-150",
        className
      )}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
```

### 3.5 — Navbar Component

**File: `components/ui/navbar.tsx`**

```tsx
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { LogoutButton } from "@/components/auth/logout-button";
import { createClient } from "@/lib/supabase/server";
import { BriefcaseBusiness } from "lucide-react";

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo / Brand */}
        <Link
          href={user ? "/dashboard" : "/"}
          className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold text-sm tracking-tight"
        >
          <BriefcaseBusiness className="h-4 w-4" />
          <span>JobTracker</span>
        </Link>

        {/* Right-side controls */}
        <div className="flex items-center gap-1">
          {user && (
            <span className="hidden sm:block text-xs text-zinc-500 dark:text-zinc-400 mr-3">
              {user.email}
            </span>
          )}
          <ThemeToggle />
          {user && <LogoutButton />}
        </div>
      </div>
    </header>
  );
}
```

### 3.6 — Root Layout

**File: `app/layout.tsx`** — Replace entirely with:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Navbar } from "@/components/ui/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JobTracker — Manage Your Applications",
  description: "A clean, minimal job application tracking tool.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 3.7 — Root Page (Landing / Redirect)

**File: `app/page.tsx`**

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");
  else redirect("/login");
}
```

---

## Phase 4: Authentication Flow

**Goal:** Build the Login and Signup pages, their Server Actions, and the Logout button. All auth routes are at `/login` and `/signup`.

### 4.1 — Shared UI Primitives (used in auth forms and beyond)

**File: `components/ui/input.tsx`**

```tsx
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-zinc-300 dark:border-zinc-700",
          "bg-white dark:bg-zinc-900",
          "px-3 py-1 text-sm text-zinc-900 dark:text-zinc-100",
          "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
          "transition-colors",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
```

---

**File: `components/ui/label.tsx`**

```tsx
import { cn } from "@/lib/utils";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-none",
        className
      )}
      {...props}
    />
  );
}
```

---

**File: `components/ui/button.tsx`**

```tsx
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          // Base
          "inline-flex items-center justify-center gap-2 rounded-md font-medium",
          "transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50",
          // Variants
          variant === "primary" && [
            "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900",
            "hover:bg-zinc-700 dark:hover:bg-zinc-300",
          ],
          variant === "secondary" && [
            "border border-zinc-300 dark:border-zinc-700",
            "bg-white dark:bg-zinc-900",
            "text-zinc-700 dark:text-zinc-300",
            "hover:bg-zinc-50 dark:hover:bg-zinc-800",
          ],
          variant === "ghost" && [
            "text-zinc-600 dark:text-zinc-400",
            "hover:bg-zinc-100 dark:hover:bg-zinc-800",
          ],
          variant === "destructive" && [
            "bg-red-600 text-white hover:bg-red-700",
          ],
          // Sizes
          size === "sm" && "h-7 px-3 text-xs",
          size === "md" && "h-9 px-4 text-sm",
          size === "lg" && "h-10 px-6 text-sm",
          size === "icon" && "h-9 w-9",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
```

### 4.2 — Auth Server Actions

**File: `app/(auth)/actions.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
```

### 4.3 — Login Page

**File: `app/(auth)/login/page.tsx`**

```tsx
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
          <div className="inline-flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 p-3 mb-4">
            <BriefcaseBusiness className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
          </div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to your account to continue.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-400">
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
            <Button type="submit" className="w-full mt-2">
              Sign in
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
          No account?{" "}
          <Link
            href="/signup"
            className="font-medium text-zinc-700 dark:text-zinc-300 underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
```

### 4.4 — Signup Page

**File: `app/(auth)/signup/page.tsx`**

Structure is near-identical to the Login page. Differences:
- Page title: `"Create an account"`, subtitle: `"Start tracking your applications."`
- Form action: `signup` (imported from `../actions`)
- Add a `confirm-password` field. Before calling `signup`, validate on the client that passwords match.
- Button text: `"Create account"`
- Footer link: `"Already have an account? Sign in"` → `/login`

> **Copilot:** Use the Login page as the exact template. Clone it, rename the component to `SignupPage`, swap in the above differences.

### 4.5 — Logout Button Component

**File: `components/auth/logout-button.tsx`**

```tsx
"use client";

import { logout } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <form action={logout}>
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        aria-label="Sign out"
        title="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </form>
  );
}
```

---

## Phase 5: Database Server Actions (CRUD)

**Goal:** Write all Server Actions for reading, creating, updating, and deleting jobs. These actions are called directly from Client Components.

### 5.1 — Job Server Actions

**File: `app/(dashboard)/actions.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { JobInsert, JobUpdate } from "@/lib/types";

// --- READ ---
export async function getJobs() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("user_id", user.id)
    .order("date_applied", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

// --- CREATE ---
export async function createJob(payload: JobInsert) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("jobs")
    .insert({ ...payload, user_id: user.id });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

// --- UPDATE ---
export async function updateJob(id: string, payload: JobUpdate) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("jobs")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id); // Belt-and-suspenders: always scope by user_id

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

// --- DELETE ---
export async function deleteJob(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("jobs")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}
```

> **Copilot Note:** All actions must be called from client components using `startTransition` + `useTransition` from React to enable optimistic loading states, or wrapped in `try/catch` with local error state. Never call them at the top level of a render.

---

## Phase 6: Dashboard Page & Job Form Modal

**Goal:** Build the dashboard shell, the jobs data table, and the Add/Edit modal form.

### 6.1 — Status Badge Component

**File: `components/jobs/status-badge.tsx`**

```tsx
import { cn } from "@/lib/utils";
import type { JobStatus } from "@/lib/types";

const statusConfig: Record<
  JobStatus,
  { label: string; className: string }
> = {
  Applied: {
    label: "Applied",
    className:
      "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-800",
  },
  Interviewing: {
    label: "Interviewing",
    className:
      "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-800",
  },
  Offer: {
    label: "Offer",
    className:
      "bg-green-50 text-green-700 ring-green-200 dark:bg-green-950/40 dark:text-green-400 dark:ring-green-800",
  },
  Rejected: {
    label: "Rejected",
    className:
      "bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700",
  },
};

export function StatusBadge({ status }: { status: JobStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
```

### 6.2 — Job Form Modal Component

**File: `components/jobs/job-form-modal.tsx`**

Build this as a `"use client"` component. It handles both Add and Edit modes based on whether a `job` prop is passed.

**Structure & behavior spec:**

- **Props:**
  ```ts
  interface JobFormModalProps {
    job?: Job;           // If provided → Edit mode. If undefined → Add mode.
    open: boolean;
    onClose: () => void;
  }
  ```
- **Modal overlay:** Fixed full-screen overlay (`fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]`). Clicking the overlay calls `onClose`. Pressing `Escape` calls `onClose` (add `useEffect` with keydown listener).
- **Modal panel:** Centered card, max width `max-w-lg`, white/zinc-900 background, rounded-xl, shadow-xl.
- **Form fields** (in order, use `Input`, `Label` components from Phase 4.1):
  1. `company_name` — Text input, required
  2. `job_title` — Text input, required
  3. `date_applied` — `<input type="date">`, required, styled consistently with `Input`
  4. `status` — `<select>` element, required. Options: Applied, Interviewing, Offer, Rejected. Style it to match `Input` exactly (same border, bg, text classes).
  5. `job_link` — Text input, optional, placeholder `https://...`
  6. `notes` — `<textarea>` rows=3, optional. Style to match `Input`.
- **State:** Use `useState` to manage each field. On modal open with an existing job, pre-populate fields.
- **Submission:**
  - Call `createJob(payload)` or `updateJob(id, payload)` from `app/(dashboard)/actions.ts` inside a `useTransition`.
  - Show a loading state on the submit button while pending (`isPending` from `useTransition`).
  - On success, call `onClose()`.
  - On error, display the error message inline above the submit button.
- **Footer buttons:** "Cancel" (secondary variant, calls `onClose`) and "Save application" or "Save changes" (primary variant, submits form).
- **Header:** Modal title "Add Application" or "Edit Application". An `X` button (Lucide `X` icon, ghost variant, icon size) in the top-right corner.

> **Copilot:** Write the complete `JobFormModal` component. Use `useTransition` for the async action call. Wrap the entire modal in a `<dialog>`-like pattern using `div` with the overlay/panel structure described above.

### 6.3 — Jobs Table Component

**File: `components/jobs/jobs-table.tsx`**

This is a `"use client"` component. It receives the full jobs array as a prop and renders a filterable, sortable table.

**Props:**
```ts
interface JobsTableProps {
  initialJobs: Job[];
}
```

**Internal state (all declared with `useState` inside this component):**
```ts
const [jobs, setJobs] = useState<Job[]>(initialJobs);
const [searchQuery, setSearchQuery] = useState("");
const [statusFilter, setStatusFilter] = useState<JobStatus | "All">("All");
const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
const [editingJob, setEditingJob] = useState<Job | null>(null);
const [isAddModalOpen, setIsAddModalOpen] = useState(false);
const [deletingId, setDeletingId] = useState<string | null>(null);
```

**Layout structure (top to bottom):**

1. **Page header row:** Left: heading `"Applications"` + job count badge (e.g., `"12 total"`). Right: `"Add Application"` button (primary).
2. **Filter bar:** A horizontal row containing:
   - Search input (`Input` component, with `Search` Lucide icon prefix inside the input wrapper)
   - Status filter `<select>` (options: All, Applied, Interviewing, Offer, Rejected)
   - Sort button or toggle (Date: Newest / Oldest)
3. **Table:** `<table>` with full width. Columns: Company · Role · Date Applied · Status · Link · Actions.
4. **Empty state:** When filtered results are zero, show a centered empty state with a `Inbox` Lucide icon, heading "No applications found", and a short subtext.

**Table implementation details:**
- The `<table>` must have `table-fixed w-full` and `text-sm`.
- `<thead>` row: sticky, `bg-zinc-50 dark:bg-zinc-900`, `text-xs uppercase tracking-wider text-zinc-500`.
- Each `<tbody>` row: `hover:bg-zinc-50 dark:hover:bg-zinc-800/50`, `border-b border-zinc-100 dark:border-zinc-800/60`.
- Date column: format using `date-fns` `format(parseISO(job.date_applied), "MMM d, yyyy")`.
- Link column: Show an `ExternalLink` Lucide icon as an anchor tag if `job_link` exists. Show `—` (em dash) if null.
- Actions column: Two icon buttons — `Pencil` (ghost, opens edit modal with that job) and `Trash2` (ghost, red on hover, triggers delete confirmation).

**Delete confirmation:** When trash icon is clicked, set `deletingId` to the job's id. Render a small inline confirmation in the table row (or a minimal confirm dialog): "Delete?" with "Yes, delete" (destructive button) and "Cancel". On confirm, call `deleteJob(id)` inside `useTransition`.

> **Copilot:** The filtering and sorting logic is detailed in Phase 7. For now, render the table with static `initialJobs` data to validate the UI.

### 6.4 — Dashboard Page

**File: `app/(dashboard)/dashboard/page.tsx`**

```tsx
import { getJobs } from "../actions";
import { JobsTable } from "@/components/jobs/jobs-table";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const jobs = await getJobs();

  return <JobsTable initialJobs={jobs ?? []} />;
}
```

---

## Phase 7: Advanced Filtering, Sorting & Polish

**Goal:** Wire up all filter state, implement derived filtered data, and apply final visual polish.

### 7.1 — Filtering & Sorting Logic (inside `JobsTable`)

Add a `useMemo` hook that derives `filteredJobs` from `jobs`, `searchQuery`, `statusFilter`, and `sortOrder`. Place this immediately after your state declarations.

```ts
import { useMemo } from "react";
import { parseISO, compareAsc, compareDesc } from "date-fns";

const filteredJobs = useMemo(() => {
  let result = [...jobs];

  // 1. Status filter
  if (statusFilter !== "All") {
    result = result.filter((job) => job.status === statusFilter);
  }

  // 2. Search filter: match company_name OR job_title (case-insensitive)
  if (searchQuery.trim() !== "") {
    const q = searchQuery.toLowerCase();
    result = result.filter(
      (job) =>
        job.company_name.toLowerCase().includes(q) ||
        job.job_title.toLowerCase().includes(q)
    );
  }

  // 3. Sort by date_applied
  result.sort((a, b) => {
    const dateA = parseISO(a.date_applied);
    const dateB = parseISO(b.date_applied);
    return sortOrder === "desc"
      ? compareDesc(dateA, dateB)
      : compareAsc(dateA, dateB);
  });

  return result;
}, [jobs, searchQuery, statusFilter, sortOrder]);
```

Use `filteredJobs` (not `jobs`) when rendering the table rows.

### 7.2 — Syncing After Mutations

After a successful `createJob` or `updateJob` or `deleteJob` call, the dashboard Server Component needs to re-render to reflect the changes. The `revalidatePath("/dashboard")` call inside the Server Actions handles this.

However, since `JobsTable` is a Client Component with `initialJobs`, also update local state immediately for instant UI feedback:

```ts
// After createJob succeeds, optimistically update:
// Re-fetch is handled by revalidatePath, but also call router.refresh() for SSR sync
import { useRouter } from "next/navigation";
const router = useRouter();

// After each mutation action succeeds:
router.refresh(); // triggers Server Component re-render, passes new initialJobs
```

> **Copilot:** Add `useRouter` and call `router.refresh()` inside each mutation's `.then()` block (or after `await` in the transition). This ensures the Server Component re-fetches data from Supabase and passes fresh `initialJobs` back down.

### 7.3 — Filter Bar Detailed Implementation

**Search input wrapper** (styled with icon prefix):
```tsx
<div className="relative flex-1 min-w-48">
  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
  <Input
    className="pl-9"
    placeholder="Search company or role..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
</div>
```

**Status select** (style `<select>` to match `Input` exactly — same height, padding, border, bg, text color):
```tsx
<select
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value as JobStatus | "All")}
  className="h-9 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-900 dark:text-zinc-100 ..."
>
  <option value="All">All statuses</option>
  <option value="Applied">Applied</option>
  <option value="Interviewing">Interviewing</option>
  <option value="Offer">Offer</option>
  <option value="Rejected">Rejected</option>
</select>
```

**Sort toggle button:**
```tsx
<Button
  variant="secondary"
  size="sm"
  onClick={() => setSortOrder(o => o === "desc" ? "asc" : "desc")}
  className="gap-1.5"
>
  <ArrowUpDown className="h-3.5 w-3.5" />
  {sortOrder === "desc" ? "Newest first" : "Oldest first"}
</Button>
```

### 7.4 — Results Summary

Below the filter bar and above the table, show a subtle summary line:

```tsx
<p className="text-xs text-zinc-400 dark:text-zinc-500">
  Showing {filteredJobs.length} of {jobs.length} application{jobs.length !== 1 ? "s" : ""}
  {statusFilter !== "All" && ` · ${statusFilter}`}
  {searchQuery && ` · "${searchQuery}"`}
</p>
```

### 7.5 — Empty States

Two distinct empty states:

1. **No jobs at all** (`jobs.length === 0`): Full-page empty state with `BriefcaseBusiness` icon, heading "No applications yet", subtext "Add your first job application to get started.", and a primary "Add Application" button.

2. **No filter results** (`jobs.length > 0 && filteredJobs.length === 0`): Smaller empty state within the table area with `Search` icon, heading "No results found", subtext "Try adjusting your search or filter.", and a ghost "Clear filters" button that resets `searchQuery` to `""` and `statusFilter` to `"All"`.

### 7.6 — Responsive Design Polish

- **Mobile (< `sm`):** Stack the filter bar vertically. The table should be wrapped in `overflow-x-auto`. Hide the "Link" column on mobile using `hidden sm:table-cell`. Actions column always visible.
- **Tablet/Desktop:** Full horizontal filter bar. Full table.

```tsx
// Wrap table:
<div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
  <table className="min-w-full table-fixed">
    ...
  </table>
</div>
```

### 7.7 — Loading States

On the Dashboard page, add a `loading.tsx` file:

**File: `app/(dashboard)/dashboard/loading.tsx`**

```tsx
export default function DashboardLoading() {
  return (
    <div className="space-y-4">
      {/* Skeleton header */}
      <div className="flex items-center justify-between">
        <div className="h-7 w-40 rounded-md bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        <div className="h-9 w-36 rounded-md bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
      </div>
      {/* Skeleton filter bar */}
      <div className="flex gap-3">
        <div className="h-9 flex-1 rounded-md bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        <div className="h-9 w-40 rounded-md bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        <div className="h-9 w-32 rounded-md bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
      </div>
      {/* Skeleton rows */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 w-full rounded-md bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
      ))}
    </div>
  );
}
```

---

## Final Checklist & Verification Steps

After completing all phases, run through this checklist manually:

### Functionality
- [ ] Unauthenticated user visiting `/dashboard` is redirected to `/login`
- [ ] Authenticated user visiting `/login` is redirected to `/dashboard`
- [ ] Sign up with email/password creates an account and redirects to `/dashboard`
- [ ] Log in with correct credentials succeeds; incorrect credentials show inline error
- [ ] Logout button signs the user out and redirects to `/login`
- [ ] "Add Application" button opens the modal form
- [ ] Submitting the form creates a new row in Supabase and appears in the table
- [ ] Clicking the edit (Pencil) icon opens the modal pre-populated with existing data
- [ ] Editing and saving updates the row in Supabase and reflects in the table
- [ ] Deleting a job removes it from the table and from Supabase
- [ ] Search input filters rows in real time
- [ ] Status dropdown filters rows correctly
- [ ] Sort toggle correctly sorts by date ascending/descending
- [ ] Combined filters work together (e.g., status = "Interviewing" + search = "Google")
- [ ] Empty states render correctly for both zero-jobs and zero-filter-results cases
- [ ] Light/Dark toggle works and persists across page refreshes

### Code Quality
- [ ] No `any` types — all data uses types from `lib/types.ts`
- [ ] No unused imports
- [ ] All Server Actions have the `"use server"` directive
- [ ] All Client Components that use hooks have `"use client"` directive
- [ ] RLS policies confirmed active in Supabase Dashboard → Authentication → Policies
- [ ] `.env.local` is in `.gitignore`

### Build
```bash
npm run build
# Must complete with 0 errors
```

---

## Appendix: File Tree (Complete)

```
job-tracker/
├── app/
│   ├── (auth)/
│   │   ├── actions.ts
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── actions.ts
│   │   └── dashboard/
│   │       ├── loading.tsx
│   │       └── page.tsx
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── auth/
│   │   └── logout-button.tsx
│   ├── jobs/
│   │   ├── job-form-modal.tsx
│   │   ├── jobs-table.tsx
│   │   └── status-badge.tsx
│   └── ui/
│       ├── button.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── navbar.tsx
│       ├── theme-provider.tsx
│       └── theme-toggle.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── middleware.ts
│   │   └── server.ts
│   ├── types.ts
│   └── utils.ts
├── middleware.ts
├── .env.local
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

*End of CLAUDE.md. This document is the single source of truth. Follow phases sequentially and do not proceed to a new phase until the current one compiles and renders correctly.*
