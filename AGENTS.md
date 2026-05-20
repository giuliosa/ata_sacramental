# Atas Sacramentais — Agent Guide

# RESPONSES
- Keep responses concise and to the point - unless the user asks otherwise

## PLANNING MODE
- Always ask clarifying questions
- Never assume design, tech stack or features
- Use deep-dive sub-agents to assist with research
- Use deep-dive sub-agents to review the different aspects of your plan before presenting to the user

## CHANGE / EDIT MODE
- Never implement features yourself when possible - use sub-agents!
- Identify changes from the plan that can be implemented in parallel, and use sub-agents to implement the features efficiently
- When using sub-agents to implement features, act as a coordinator only
- Use the best model for the task - premium models for complex tasks (like coding) and mid-tier models for simpler tasks, like documentation
- After completing features (large or small), always run commands like lint, type check and next build to check code quality

## DATABASE SCHEMA CHANGES
- Whenever you make changes to the database schema, ALWAYS run the drizzle generate and migrate commands
- NEVER run drizzle push!

## TESTING
- Use any testing tools, libraries available to the project for testing your changes
- Never assume your changes simply work, always test!
- If the project does not have any testing tools, scripts, MCP tools, skills, etc. available for testing, ask the user whether testing should be skipped.

## UI DESIGN
- Always follow the UI design system when creating or reviewing components or pages.
- Design System: @DESIGN.md

## Stack
- **Next.js 14** (App Router), **Supabase** (PostgreSQL + Auth + RLS), **Tailwind CSS**, **TanStack Query v5**, **React Hook Form + Zod**, **TypeScript** strict

## Commands
```bash
npm run dev          # next dev
npm run build        # next build
npm run lint         # next lint (next/core-web-vitals)
npm run type-check   # tsc --noEmit (not part of build)
npm run test         # vitest (no tests written yet — zero *.test.* files exist)
npm run db:generate  # supabase gen types typescript --local > src/types/supabase.ts
```

**Order**: `lint` → `type-check` → `build` before commit.

## Architecture
- **Path alias**: `@/*` → `./src/*`
- **Three Supabase clients** (all typed with `Database`):
  - `src/lib/supabase/client.ts` — browser (Client Components)
  - `src/lib/supabase/server.ts` — server (Server Components, Route Handlers, `next/headers`)
  - `src/lib/supabase/middleware.ts` — middleware (takes request/response for cookie sync)
- **Auth**: Google OAuth via Supabase. Profile synced from `auth.users` to `public.users` via DB trigger (`private.sync_auth_user_profile`).
- **Roles**: `adm | editor | reader` — enforced via RLS in SQL (migrations) + `src/lib/permissions.ts` (frontend)
- **Middleware** (`src/middleware.ts`): protects routes, redirects `/` → `/dashboard` or `/login`, preserves `redirectTo` param. Matches all routes except static assets.
- **Route groups**: `(auth)` for public pages, `(app)` for authenticated pages (Server Component layout fetches user profile with `alas+estacas` join)
- **RLS**: each user sees only their own ward's (`ala`) data. RLS helper functions: `get_user_role()`, `get_user_ala_id()`
- **Sessions**: cookie-based via `@supabase/ssr`. Server client reads cookies from `next/headers`, middleware syncs cookies between request/response.

## Conventions
- **Dates**: ISO `yyyy-MM-dd` in DB/API, `dd/mm/yyyy` in forms and display (`utils.ts` has `formatDateBR`/`parseDateBR`)
- **Form validation**: Zod schemas in `src/lib/schemas.ts`, resolved via `@hookform/resolvers`
- **API responses**: all endpoints return `{ data: T } | { error: string }` shape
- **Notifications**: `sonner` toast (`toast.success/error`)
- **UI**: Tailwind utility classes, `cn()` helper (clsx + twMerge), lucide-react icons, custom `brand` color palette
- **Dark mode**: `class` strategy via `next-themes`, `ThemeScript` prevents FOUC
- **Print**: dedicated `print:` breakpoint in Tailwind config
- **Generated types**: `src/types/supabase.ts` is generated — edit the SQL migration, then `npm run db:generate`
- **No tests exist** — vitest is configured with jsdom. First test goes in a `__tests__/` dir or next to source.
- **Tasks dirs** (empty/stub): `src/features/admin/`, `src/features/modelos/` — admin and model management not yet implemented.

## DB/Supabase
- Migrations in `supabase/migrations/`, seeds in `supabase/seeds/`
- `supabase db push` applies migrations to remote. SQL Editor in dashboard also works.
- `MAX_MODELOS=3` in `.env.local` limits models
- `SUPABASE_SERVICE_ROLE_KEY` in env (server-only) — never exposed to client
