# Community forum (Discourse + DiscourseConnect)

A self-hosted [Discourse](https://github.com/discourse/discourse) that only QuickMD
patients can enter. Discourse has no accounts of its own: this app is its
DiscourseConnect provider, and QuickMD is the only source of identity.

## Flow

1. A patient opens the forum. `login_required` sends them to
   `/api/discourse/sso?sso=…&sig=…`.
2. That route checks Discourse's HMAC-SHA256 signature and makes sure `return_sso_url`
   points at `DISCOURSE_URL`. Without that check, a forged request could have us send
   a signed identity to another site.
3. If the `qmd_patient_session` cookie holds a valid session, the route sends the
   browser straight back to Discourse.
4. Otherwise the patient signs in at `/community/login`. The action calls the
   patient-web API's `POST api/v2/auth/login`, then looks up the patient with
   `GET api/v1/profile`, and completes the handshake. It keeps that patient in an
   HMAC-signed, httpOnly cookie for 30 days.
5. Discourse checks its own nonce, then creates or updates the user.

The app keeps its own session, just as any identity provider does, and doesn't hold on to
the Stytch JWT. That JWT expires after 60 minutes, while Discourse keeps its session much
longer, so the app would forget a patient the forum still shows as signed in. Discourse's
`maximum_session_age` is set to 720 hours, so both sessions last 30 days. Signing out of
either one ends both. Discourse's `logout_redirect` clears the app's cookie. The app's
sign-out calls the admin API (`DISCOURSE_API_KEY`) to log the patient out of the forum.

What reaches Discourse is limited to:

| Field | Value |
| --- | --- |
| `external_id` | `PatientGlobalKey` |
| `email` | the patient's email. Staff can see it; other members can't |
| `username` | `patient-` plus 8 hex characters: an HMAC of the global key, stable and not reversible |
| `groups` | `patients`, plus each cohort name lowercased with `_` separators |
| `require_activation` | `false` once QuickMD has verified the email |

If the email isn't verified, Discourse makes the patient confirm it by email first.
Without this, anyone could register a QuickMD account using someone else's address and
be linked to that person's forum account. The shared gimli test patient is unverified,
so its forum account was activated by hand.

No real name is sent. Discourse only syncs groups an admin has already created, so a
cohort shows up on the forum only once someone creates a group with that name. Create
those groups with visibility set to "group owners and staff".

The code lives in `src/lib/discourse/connect.ts`, `src/lib/quickmd/api.ts`,
`src/app/api/discourse/` and `src/app/community/login/`.

## Running it locally

Discourse can't run on Vercel: it needs a long-running Rails server, Sidekiq workers,
Postgres and Redis. So it runs on your machine in Discourse's official development
container, and this app runs beside it with `npm run dev`.

| | URL |
| --- | --- |
| This app | http://localhost:3000 |
| Discourse | http://localhost:4200. Not Discourse's usual 3000, which this app uses |
| Mailpit (every email Discourse sends) | http://localhost:8025 |

**Prerequisites:** a Docker runtime. On a Mac, `brew install colima docker`, then
`colima start --cpu 4 --memory 12 --disk 60`. With less than 12 GB, the asset builder runs out of memory and takes the server down with it. The dev image has native arm64 builds.

**First time:**

1. `npm install`, then `scripts/discourse-local.sh setup`. Setup does the following:
   - checks Docker is running and has enough memory
   - creates `.env.local` from `.env.example` if it's missing, pointing at gimli and
     `http://localhost:4200`, and generates `DISCOURSE_CONNECT_SECRET`
   - clones Discourse to `~/quickmd/discourse` and starts the container
   - installs gems and packages, and migrates the database
   - applies the settings below and writes `DISCOURSE_API_KEY` into `.env.local`
   - seeds sample content (below)
   - starts the server

   Expect about 15 minutes the first time.
2. Optional: for DevTools' one-click sign-in, add `DEMO_PATIENT_EMAIL` and
   `DEMO_PATIENT_PASSWORD` to `.env.local`. Take them from
   `~/quickmd/patient-web/tests/.env.test.example`. You can also type them into the
   sign-in page.
3. `npm run dev`, or restart it if it was already running, so it reads `.env.local`.
   Then open http://localhost:3000.

**Sample content:** `scripts/discourse-local.sh seed` adds five member accounts and four
categories: Introductions, Wins, Day to day, and Using QuickMD. It also adds five
topics with replies, dated across the last two weeks. It's safe to re-run: anything
that exists already is skipped. The members' pseudonyms look like real patients' but
they have no SSO record, so nobody can sign in as them. The content is written in
`scripts/discourse-seed.rb`, and none of it mentions doses, medications or crisis, so
it won't trip the safety net.

**After that:** `scripts/discourse-local.sh start`, `stop`, or `logs`. The database lives
in `~/quickmd/discourse/data/postgres` and survives restarts. If `.env.local` loses its
`DISCOURSE_API_KEY`, `scripts/discourse-local.sh configure` issues a new one.

DiscourseConnect runs entirely through browser redirects, and Discourse never calls
this app. The one server-to-server call goes the other way: when you sign out, the app
calls Discourse's admin API.

Site settings that make it patient-only (applied by `configure`, which you can re-run
on its own):

- `enable_discourse_connect`, `discourse_connect_url`, `discourse_connect_secret`
- `discourse_connect_overrides_groups`, `auth_overrides_username`
- `auth_overrides_email`, which requires `email_editable=false`
- `login_required`, `wizard_enabled=false`, `enable_names=false`
- `logout_redirect=<app>/api/discourse/logout`, `maximum_session_age=720` (30 days)
- `external_system_avatars_url` blank and `automatically_download_gravatars=false`,
  so no patient email hashes go to Gravatar
- `port=4200`, so the return URLs Discourse signs point at the right port

The script also creates a hidden `patients` group, visible only to its owners and staff.
DiscourseConnect turns off password login, so staff come in through SSO like everyone
else. To promote a user, run
`docker exec -u discourse -w /src discourse_dev bin/rails runner 'User.find_by(username: "…").grant_admin!'`.

Email works locally: activation mail for patients with an unverified QuickMD email lands in
Mailpit, where you can click the link.

## Path to production

- **Hosting:** a VM running the official `discourse_docker` install, on Azure under the
  Microsoft BAA, in its own resource group, with backups to storage we own and email
  through a BAA-covered provider.
- **Where SSO lives:** the provider moves into the backend, modelled on
  `LiveChatCreateAuthTokenApiRequestHandler.cs`, which already signs `external_id` and
  `email` for Zendesk. Patient-web's session sits in localStorage, not a cookie, so
  patient-web gets a `/community/sso` route. That route posts the bearer token plus
  `sso` and `sig` to the backend and follows the redirect it returns. Logged-out
  patients go through the normal login with `redirectUrl`, which
  `useHandleRedirectOnLogin` already supports for in-app paths.
- **Offboarding:** use the admin `sync_sso` API to update profiles, and log out or
  suspend discharged patients without waiting for them to sign in again.
- **Privacy:** forum membership alone shows that someone is a patient, and some cohorts
  are Suboxone programs, so 42 CFR Part 2 applies as well as HIPAA. That calls for:
  - pseudonymous usernames only
  - no Gravatar
  - hidden group membership
  - email only through providers covered by a BAA
  - a legal review before any real patient is invited

## DevTools (for demos)

A floating panel, ported in slimmed-down form from the design system's DevTools
(`features/devTools`), sits in the bottom-right corner of every page. It's always on,
production included, because this app exists to be demoed.

- **Demo tab:** shows whose session the app holds, with their pseudonym and groups. It
  also has a one-click "Sign in as test patient", "Sign out everywhere", and short notes
  about gimli and email verification.
- **Environment tab:** the commit, the patient API, the Discourse URL, and whether the
  DiscourseConnect secret is set.

One-click sign-in uses `DEMO_PATIENT_EMAIL` and `DEMO_PATIENT_PASSWORD`. These are
server-only, so the password never reaches the browser.

A write-up with a sequence diagram is on the Community card, under "How it's wired".
