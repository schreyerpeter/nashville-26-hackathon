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
3. If the `qmd_patient_token` cookie holds a live session, the route looks up the
   patient with `GET api/v1/profile` and sends the browser straight back to Discourse.
4. Otherwise the patient signs in at `/community/login`. The action calls the
   patient-web API's `POST api/v2/auth/login`, stores the Stytch session JWT (60 minutes)
   in an httpOnly cookie, and completes the handshake.
5. Discourse checks its own nonce, then creates or updates the user.

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

## Environments

| Variable | Dev value |
| --- | --- |
| `QUICKMD_API_URL` | `https://patient-web-api.gimli.quickmd.dev/` (has the shared Playwright test patient) |
| `DISCOURSE_URL` | `https://community.dev-common.quickmd.dev` |
| `DISCOURSE_CONNECT_SECRET` | `openssl rand -hex 32`, and must match Discourse's `discourse_connect_secret` |

DiscourseConnect runs entirely through browser redirects, and the Discourse server
never calls this app. So `discourse_connect_url` can point at `http://localhost:3000`
for local testing, or at the Vercel deployment for everyone else.

## Azure (dev)

Everything is in subscription **QuickMD2 Subscription**, resource group
`rg-dev-common-westus`, and tagged `purpose=discourse-hackathon`:

| Resource | Name |
| --- | --- |
| VM (Ubuntu 24.04, B2ms, 64 GB) | `vm-community-dev`, static IP `20.237.210.22`, SSH user `qmdadmin` |
| NSG | `vm-community-devNSG`: 80 and 443 from the internet; 22 from the installer's IP only |
| DNS | `community` A record in `dev-common.quickmd.dev` (resource group `rg-dev-common`) |
| Email | `ecs-community-dev` (Azure-managed domain) and `acs-community-dev` |
| SMTP identity | Entra app `acs-community-dev-smtp` |

To delete everything:
`az resource list -g rg-dev-common-westus --tag purpose=discourse-hackathon`, delete
those resources, then remove the DNS record.

Discourse runs the standard single-container install from
[discourse_docker](https://github.com/discourse/discourse_docker) at `/var/discourse`,
with Let's Encrypt TLS. To rebuild after editing `containers/app.yml`:

```bash
ssh -i ~/.ssh/qmd-community-dev qmdadmin@20.237.210.22
cd /var/discourse && sudo ./launcher rebuild app
```

Site settings that make it patient-only:

- `enable_discourse_connect`, `discourse_connect_url`, `discourse_connect_secret`
- `discourse_connect_overrides_groups`, `auth_overrides_username`
- `auth_overrides_email`, which requires `email_editable=false`
- `login_required`, `wizard_enabled=false`
- `enable_names=false`
- `logout_redirect=<app>/api/discourse/logout`
- `external_system_avatars_enabled=false` and `automatically_download_gravatars=false`,
  so no patient email hashes go to Gravatar
- `verbose_discourse_connect_logging` (dev only)

The `patients` group already exists, with both visibility settings at "group owners
and staff". The local admin is `qmd_admin` (`peter@quick.md`), but DiscourseConnect
turns off password login. So staff come in through SSO like everyone else. To promote
an SSO user, run `User.find_by(username: "…").grant_admin!` with `rails runner`
inside the container.

### Email (needs an Azure admin once)

SMTP goes through Azure Communication Services at `smtp.azurecomm.net:587`, sending
from `DoNotReply@49f03799-2b1c-4db8-b677-847e0225be03.azurecomm.net`. The
Entra app `acs-community-dev-smtp` needs the **Communication and Email Service Owner**
role on `acs-community-dev`, and assigning roles takes Owner or User Access
Administrator. After that:

1. Create a client secret with
   `az ad app credential reset --id c1018c13-1f1c-4f47-9af7-e9c764e665fe --append`.
2. Put it in `DISCOURSE_SMTP_PASSWORD` in `containers/app.yml` on the VM.
3. Rebuild.

Login works without email. Only notifications and digests need it.

## Path to production

- **Hosting:** keep it on Azure under the Microsoft BAA, in its own resource group,
  with backups to storage we own.
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
(`features/devTools`), sits in the bottom-right corner of every page. It follows the same
rules: it's on everywhere except production, where you open it with `?devTools=true`
(remembered in localStorage) and turn it off with `?devTools=false`.

- **Demo tab:** shows who the session cookie belongs to, with their pseudonym and groups.
  It also has a one-click "Sign in as test patient" and short notes about gimli and
  email verification.
- **Environment tab:** the commit, the patient API, the Discourse URL, and whether the
  DiscourseConnect secret is set.

One-click sign-in uses `DEMO_PATIENT_EMAIL` and `DEMO_PATIENT_PASSWORD`. These are
server-only, so the password never reaches the browser.

A write-up with a sequence diagram is on the Community card, under "How it's wired".
