# nashville-26-hackathon

Project shell for the Nashville 2026 hackathon. Next.js (App Router, TypeScript,
Tailwind) on Vercel, with Supabase wiring in place and continuous deployment from
`main`.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in once the Supabase project exists
npm run dev
```

The app runs at http://localhost:3000. `/api/health` reports the environment, the
deployed commit, and whether Supabase is reachable.

## Deploys

Pushing to `main` builds and promotes to production. Pushing any other branch
produces a preview deployment with its own URL.

## Supabase

Credentials come from the Supabase dashboard under Project Settings then API:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable (anon) key |

Both are safe to expose to the browser; row level security is what protects the
data, so enable it on every table you add.

Use `createClient()` from `@/lib/supabase/server` in Server Components and Route
Handlers, and from `@/lib/supabase/client` in Client Components. Both throw a
clear error when the credentials are missing rather than failing deeper in a
request, and `isSupabaseConfigured()` from `@/lib/supabase/env` lets a page
degrade gracefully instead of throwing at all.

## Layout

```
src/
  app/
    api/health/route.ts   deployment and Supabase status
    page.tsx              landing shell
  lib/supabase/           browser client, server client, env guards
```
