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

The app runs at http://localhost:3000. `/ideas` is the team idea board, and `/api/health` reports the environment, the
deployed commit, and whether Supabase is reachable.

## Design

The UI uses QuickMD's design system: its tokens are ported into
`src/app/globals.css`, and shared pieces live in `src/components/ui/`. See
[DESIGN.md](DESIGN.md) before building anything visible.

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

## Database

Schema changes live in `supabase/migrations`. The CLI is linked to project
`apwrrmmbkxwniibbzaep` (run `supabase link --project-ref apwrrmmbkxwniibbzaep` on a
new machine), and after adding a migration:

```bash
supabase db push
supabase gen types typescript --linked > src/lib/supabase/database.types.ts
```

## Idea board

`/ideas` is open to anyone, with no sign-in. Visitors can add a name to what they
post, or leave it blank and post as Anonymous. A random token in an httpOnly cookie
identifies each browser, and it's used to keep votes to one per idea and to let
people delete only what they posted. The tables allow no direct access; every read
and write goes through security definer functions (`list_ideas`, `create_idea`,
`set_vote`, and so on) that never return a token.

## Layout

```
src/
  app/
    api/health/route.ts   deployment and Supabase status
    ideas/                idea board: list, detail, server actions
    page.tsx              landing shell
  lib/supabase/           browser client, server client, env guards, DB types
supabase/migrations/      schema and row level security
```

## Community forum

`/api/discourse/sso` makes this app the DiscourseConnect provider for a self-hosted
Discourse: patients sign in with their QuickMD account and appear on the forum under a
pseudonym. See [DISCOURSE.md](DISCOURSE.md) for the flow, the Azure setup, and the
path to production.
