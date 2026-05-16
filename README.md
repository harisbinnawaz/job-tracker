# 💼 JobTracker

<p align="center">

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![Resend](https://img.shields.io/badge/Resend-000000?style=flat-square&logo=resend&logoColor=white)

</p>

<br>

> ### 🎯 Production-grade job application tracker
>
> A minimalist, full-stack SaaS-style web app for capturing, filtering, and managing hiring pipelines with **enterprise auth patterns** and **zero-trust data access**.

<br>

---

<br>

## 📋 Project Overview

**JobTracker** is a clean, professional job application management system built for candidates who need a single source of truth across companies, roles, statuses, and timelines. Engineered with a muted Zinc/Slate design system, dark-mode parity, and a dashboard-first UX that prioritizes speed, clarity, and recruiter-ready polish.

The application delivers authenticated CRUD workflows, real-time client-side discovery, and server-authoritative mutations—deployed as a serverless edge application with managed PostgreSQL and transactional email infrastructure.

<br>

---

<br>

## 🛠️ Tech Stack

| **Layer** | **Technology** |
| :--- | :--- |
| **Framework** | Next.js 16 · App Router · React 19 |
| **Language** | TypeScript (strict) |
| **Styling** | Tailwind CSS 4 · `next-themes` · Lucide React |
| **Backend / DB** | Supabase · PostgreSQL · `@supabase/ssr` |
| **Auth & Email** | Supabase Auth · Resend (custom SMTP) |
| **Deployment** | Vercel · Git-based CI/CD |
| **Utilities** | `date-fns` · Server Actions · Edge Middleware |

<br>

---

<br>

## ⚙️ Key Engineering Highlights

<br>

### 🔒 Secure Data Architecture

- **PostgreSQL schema design** with typed columns, foreign-key cascades, and **rigid `CHECK` constraints** on enumerated job statuses (`Applied`, `Interviewing`, `Offer`, `Rejected`) to enforce data integrity at the database layer.
- **Row Level Security (RLS)** policies scoped to `auth.uid()` — users can only `SELECT`, `INSERT`, `UPDATE`, and `DELETE` their own rows; zero trust-by-default, no service-role bypass in the client.
- **Server-side validation** mirrors DB constraints before mutations to fail fast with actionable errors.

<br>

### 🔑 Advanced Session Lifecycle Management

- **Custom Edge Middleware** (`lib/supabase/middleware.ts`) refreshes Supabase sessions on every matched request via `auth.getUser()`.
- **`applyCookies` pattern** copies refreshed SSR session cookies onto `NextResponse.redirect()` objects — eliminating auth cookie loss and **redirect loops** on protected routes (`/dashboard`) in production (Vercel).
- **Server Action session hydration** — `getUser()` invoked post-`signIn` / `signUp` before `redirect()` to guarantee cookie persistence across the App Router boundary.

<br>

### ⚡ Modern Mutation Paradigms

- **Next.js Server Actions** (`"use server"`) for all CRUD — no REST API surface area, reduced attack vectors, colocated with route segments.
- **React `useTransition`** in client components for non-blocking UI during `createJob`, `updateJob`, and `deleteJob` — optimistic UX with `router.refresh()` for SSR cache coherence via `revalidatePath`.
- **Auth mutations** (`login`, `signup`, `logout`) as form-backed Server Actions with encoded error/success query-state routing.

<br>

### 📊 Optimized Data Performance

- **`useMemo`-driven derived state** for O(n) filtering across company name and job title, status/experience facet filters, and **multi-attribute date sorting** (`date-fns` `compareAsc` / `compareDesc`).
- **Zero network round-trips** for search/filter toggles — compute runs entirely on hydrated client state synced from Server Component `initialJobs`.
- **Skeleton loading** (`loading.tsx`) and sticky table headers for perceived performance on large datasets.

<br>

### 🚀 Production Deployment

- **Vercel CI/CD** — push-to-deploy pipeline with environment-scoped secrets (`NEXT_PUBLIC_SUPABASE_*`, `NEXT_PUBLIC_SITE_URL`).
- **Custom SMTP via Resend** integrated with Supabase Auth for reliable signup/login transactional email delivery on production domains.
- **Auth callback route** (`/auth/callback`) with `exchangeCodeForSession` and safe `next` param sanitization for OAuth/email-link flows.

<br>

---

<br>

## 🏗️ Architecture at a Glance

<br>

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Browser   │────▶│  Next.js (Vercel) │────▶│    Supabase     │
│  React 19   │◀────│  App Router + MW  │◀────│  PostgreSQL+RLS │
└─────────────┘     └──────────────────┘     └─────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Resend (SMTP)   │
                    └──────────────────┘
```

<br>

---

<br>

## ✨ Core Features

| **Feature** | **Implementation** |
| :--- | :--- |
| 🔐 **Authentication** | Email/password · protected routes · session refresh middleware |
| 📝 **Job CRUD** | Server Actions · modal forms · inline delete confirmation |
| 🔍 **Discovery** | Full-text search · status filter · experience filter · date sort |
| 🌗 **Theming** | System/light/dark via `next-themes` |
| 📱 **Responsive UI** | Mobile-first table · glass-panel design system |

<br>

---

<br>

## ▶️ Quick Start

<br>

**Local development**

```bash
# Install dependencies
npm install

# Configure environment (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Run development server
npm run dev
```

<br>

**Production build**

```bash
# Production build
npm run build && npm start
```

<br>

---

<br>

## 📁 Project Structure

<br>

```
app/
├── (auth)/          # login, signup, Server Actions
├── (dashboard)/     # dashboard, job CRUD actions
├── auth/callback/   # Supabase OAuth/email callback
components/
├── jobs/            # table, modal, status badge
├── ui/              # design system primitives
lib/
├── supabase/        # browser, server, middleware clients
└── types.ts         # Job, JobStatus, constraints
middleware.ts        # session refresh + route guards
```

<br>

---

<br>

## 🏷️ Keywords

`Next.js App Router` · `TypeScript` · `Supabase RLS` · `PostgreSQL CHECK constraints` · `Server Actions` · `SSR Cookies` · `Edge Middleware` · `useMemo` · `useTransition` · `Vercel` · `Resend SMTP` · `Full-Stack` · `SaaS` · `Auth` · `CRUD`

<br>

---

<br>

## ©️ License

Private portfolio project. All rights reserved By Muhammad Haris Bin Nawaz.
