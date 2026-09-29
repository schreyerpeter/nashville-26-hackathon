# nashville-26-hackathon

The QuickMD Community: a private Discourse forum that only QuickMD patients can
join. This app is its DiscourseConnect provider, so patients sign in with their
QuickMD account and appear on the forum under a pseudonym. Next.js (App Router,
TypeScript, Tailwind) on Vercel, with continuous deployment from `main`.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the Discourse and patient API values
npm run dev
```

The app runs at http://localhost:3000. `/` is the patient landing page,
`/community/login` is the sign-in page Discourse sends patients to, and
`/api/health` reports the environment, the deployed commit, and whether Discourse
and the patient API are configured.

See [DISCOURSE.md](DISCOURSE.md) for the sign-in flow, the environment variables,
the Azure setup, the DevTools demo panel, and the path to production.

See [PLAN.md](PLAN.md) for what we're building next for the hackathon: the safety net,
the come-back loop, retention data in Snowflake, and the demo script.

## Design

The UI uses QuickMD's design system: its tokens are ported into
`src/app/globals.css`, and shared pieces live in `src/components/ui/`. See
[DESIGN.md](DESIGN.md) before building anything visible.

## Deploys

Pushing to `main` builds and promotes to production. Pushing any other branch
produces a preview deployment with its own URL.

## Layout

```
src/
  app/
    api/discourse/        DiscourseConnect handshake and forum sign-out
    api/health/route.ts   deployment and configuration status
    community/login/      patient sign-in page and server actions
    page.tsx              patient landing page
  components/
    devtools/             floating demo panel
    ui/                   design-system class recipes and logo
  lib/
    discourse/            DiscourseConnect signing and pseudonyms
    quickmd/              patient-web API client
    session.ts            the app's signed patient session cookie
```
