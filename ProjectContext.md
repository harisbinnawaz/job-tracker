# Project Context

## Core Purpose

JobTracker is a full-stack web application for tracking job applications. It gives authenticated users a single dashboard to record companies, roles, experience requirements, application dates, statuses, links, and notes so they can manage their hiring pipeline in one place.

## Tech Stack

- Framework: Next.js 16 with the App Router and React 19
- Language: TypeScript
- Styling: Tailwind CSS 4 with `next-themes` for light/dark/system themes
- Backend and database: Supabase with PostgreSQL
- Authentication: Supabase Auth with SSR cookie handling
- Mutations: Next.js Server Actions
- Utilities: `date-fns`, `lucide-react`, `clsx`, and `tailwind-merge`
- Deployment target: Vercel, with Supabase-hosted data and auth infrastructure

## System Architecture

The app uses a dashboard-first App Router structure:

- `app/(auth)` contains login, signup, and auth Server Actions.
- `app/(dashboard)` contains the protected dashboard route and job CRUD Server Actions.
- `app/auth/callback` handles Supabase auth callback flows.
- `components/jobs` contains the job table, modal form, and status display UI.
- `components/ui` contains shared interface primitives such as buttons, inputs, navigation, labels, and theme controls.
- `lib/supabase` contains browser, server, and middleware Supabase clients.
- `lib/types.ts` defines job-related TypeScript types and status validation helpers.
- `supabase/migrations` stores database changes, including job status constraint updates and auth email lookup support.

Requests pass through `proxy.ts`, which delegates to Supabase middleware for session refresh and route guarding. Server Components fetch authenticated data, while client components handle filtering, sorting, modal state, and non-blocking UI transitions. Database access is scoped by Supabase authentication and user-specific filtering.

## Primary Features and Problem-Solving Approaches

- Authenticated job tracking with protected dashboard access.
- Job CRUD through Server Actions instead of a separate REST API layer.
- User-scoped data reads and writes, reinforced by Supabase/PostgreSQL constraints and authentication checks.
- Client-side search, status filtering, experience filtering, and date sorting over server-provided job data.
- Modal-based create and edit flows with UI state updates and `router.refresh()` for server/client consistency.
- Status modeling through shared TypeScript constants and database `CHECK` constraints.
- Session lifecycle handling through Supabase SSR cookies, middleware refresh, and redirects for authenticated versus unauthenticated users.
- Responsive, theme-aware UI with reusable components and visual status badges.
