# LifeOS

LifeOS is a production-ready SaaS productivity dashboard built with Next.js App Router, TypeScript, Tailwind CSS, Supabase Auth, and a Supabase Postgres backend protected by Row Level Security.

## What ships in this app

- Secure Supabase email/password authentication
- Cookie-based session handling with middleware route protection
- Dashboard with today's tasks, recent notes, quick-add panels, and a live world clock
- Full task CRUD with filters for today, pending, and completed
- Full note CRUD with tags, search, and a pinned-note workflow for Focus Mode
- Focus Mode for today's execution plus one pinned note
- Toasts, loading states, empty states, and mobile-responsive navigation
- Vercel-ready project structure and deployment documentation

## Tech stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS 4
- Supabase Auth + Postgres + RLS
- Vercel deployment target

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file and add your Supabase values:

```bash
cp .env.example .env.local
```

3. Set these values in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

4. Run the SQL in [supabase/setup.sql](/C:/Users/Asus/Desktop/LifeOS/supabase/setup.sql) inside the Supabase SQL editor.
   The script is safe to rerun and repairs partially-created tables by adding missing LifeOS columns, defaults, indexes, and RLS policies.

5. In Supabase Auth:

- Enable Email provider
- Add `http://localhost:3000` to your Site URL or redirect allow-list for local testing
- Add your production Vercel URL after deployment

6. Start the app:

```bash
npm run dev
```

## Supabase database and RLS

The full schema and policies live in [supabase/setup.sql](/C:/Users/Asus/Desktop/LifeOS/supabase/setup.sql).

What the SQL does:

- Creates the `task_priority` enum
- Creates `tasks` and `notes` with the required columns
- Adds useful indexes for user-scoped queries
- Enables and forces Row Level Security on both tables
- Enforces `auth.uid() = user_id` for select, insert, update, and delete

Important note:

- Focus Mode uses the reserved `pinned` note tag to decide which note to surface

## Environment variables

The app only needs two public Supabase values because all database access is still gated by an authenticated Supabase session plus RLS.

- `NEXT_PUBLIC_SUPABASE_URL`: your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: your Supabase publishable key

Compatibility note:

- The code also accepts `NEXT_PUBLIC_SUPABASE_ANON_KEY` as a fallback for older Supabase projects, but the preferred variable is `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Never add the Supabase service role key to this app.

## Vercel deployment

1. Push this project to GitHub, GitLab, or Bitbucket.
2. In Vercel, choose **Import Project** and select the repository.
3. Add the same environment variables from `.env.local` to the Vercel project:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Deploy.
5. In Supabase Auth settings, add your Vercel production URL to the allowed redirect/site URL settings.
6. Re-deploy if you change environment variables.

This project does not contain hardcoded secrets and is ready for Vercel's standard Next.js build pipeline.

## Folder structure

```text
app/
  (app)/            Protected product routes
  (auth)/           Authentication routes
  api/              Session-validated CRUD route handlers
components/         Shell, pages, forms, and UI primitives
lib/                Supabase clients, auth helpers, validation, constants, utilities
supabase/           SQL setup for schema and RLS
types/              Shared TypeScript models
middleware.ts       Session refresh + route protection
```

## Security model

- Middleware refreshes the Supabase session and redirects unauthenticated users to `/login`
- Protected layouts also validate the session server-side
- Every CRUD route validates the current user before touching data
- Database access is scoped by Row Level Security
- The client never uses a service role key
- Input is validated with Zod before inserts and updates

## Performance notes

- Product pages render from the server where possible
- CRUD flows update local client state for fast feedback
- Notes search uses `useDeferredValue`
- Lucide icons are optimized through `optimizePackageImports`
- The world clock persists visible zones in local storage without extra backend load
