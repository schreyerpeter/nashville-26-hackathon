# Plan: QuickMD Patient Community (hackathon)

Decided 2026-09-29 in a scope review. The community is for QuickMD patients, not staff.
We're building it for the hackathon demo, but nothing in it should need tearing out
before a real patient pilot.

## The pitch (one line)
Peer support is associated with 84% vs 54% retention in telehealth buprenorphine
([JMIR 2026](https://www.jmir.org/2026//e100527/)). We built a QuickMD-only community
that is safe by default, brings patients back, and measures its own retention effect in
Snowflake.

## Why these choices
- **The keyword filter holds posts; AI only hides them.** Discourse's watched words can
  hold a post before anyone sees it. The AI triage runs after a post goes live, so it
  hides the post within seconds, and we accept that short window. A public auto-reply
  would tell other patients that someone is in crisis, so the poster gets a private
  message instead.
- **No DMs between patients.** Selling or trading meds happens mostly in private
  messages, which the filters can't hold.
- **Our own weekly email.** Discourse's digest includes titles and excerpts. A preview
  like "Day 4 off Suboxone…" would reveal treatment to anyone who sees the inbox.
- **Only metadata goes to Snowflake.** Anything sent alongside the patient key becomes
  42 CFR Part 2 data in the warehouse. So we send the least data that still answers the
  question "does the community move retention?"

## In scope
1. **Safety net.** Crisis posts held or hidden, the poster privately shown 988 / 911 /
   SAMHSA and a care-team link, staff alerted. Diversion blocked. Dosing advice flagged.
   No patient-to-patient DMs or chat.
2. **Come-back loop.** Private reply notifications, plus a content-free weekly email
   ("You have 3 new replies") sent by this app.
3. **Retention data in Snowflake.** Engagement metadata only (patient key, event type,
   timestamp, category). Never post text or titles.

Not in scope: in-app entry point, onboarding and cohort spaces, hosted presence/seeding.

## Build order (defaults picked for speed; change any of them)

### 1. Safety net (≈half the demo)
- [ ] **Discourse settings** (admin UI on the dev VM, or a seed script using the admin
  API so it can be rerun):
  - watched words: diversion terms → Block, crisis terms → Require approval
  - pending-post message = the resource copy (988, 911, SAMHSA 1-800-662-4357, "message
    your care team")
  - PMs and chat staff-only (`personal_message_enabled_groups` = staff, chat off or
    staff-only)
- [ ] **AI triage** (bonus, since the crisis demo already works on watched words alone):
  install discourse-ai and discourse-automation (needs a container rebuild), connect
  Azure OpenAI, and add a "Triage posts using AI" rule that hides crisis and dosing
  posts.
- [ ] **Relay route** `src/app/api/discourse/webhook/route.ts`:
  - verify `X-Discourse-Event-Signature` (HMAC with a new `DISCOURSE_WEBHOOK_SECRET`)
  - on a flagged or hidden post: send a system PM to the poster with the resources, and
    post a Slack alert (`SLACK_ALERT_WEBHOOK_URL`) containing only a review-queue link,
    never the post text
- [ ] **DevTools Demo tab:** "Post a crisis test message" button (posts as the test
  patient through the API) so the demo is one click.

### 2. Come-back loop
- [ ] Discourse settings: `private_email` on, `slug_generation_method` = none,
  `disable_mailing_list_mode` on, default digest frequency = never.
- [ ] **Weekly nudge** `src/app/api/cron/weekly-nudge/route.ts` on a Vercel cron
  (`CRON_SECRET`):
  - for each patient, read unread reply counts from the Discourse admin API
  - send "You have N new replies in QuickMD Community" through ACS SMTP, with a generic
    subject and no content
- [ ] **DevTools:** "Preview weekly nudge" shows the rendered email, and sends it if SMTP
  is configured. Email is blocked on the ACS role grant (DISCOURSE.md), so the preview is
  the fallback for the demo.

### 3. Retention in Snowflake
- [ ] **Sync route** `src/app/api/cron/snowflake-sync/route.ts` (Vercel cron): pull
  events from the Discourse admin API and select only `external_id`, event type
  (signed in, posted, replied, read), timestamp and category id.
- [ ] Write the events to `COMMUNITY_EVENTS` in a dev Snowflake schema (`snowflake-sdk`,
  `SNOWFLAKE_*` env vars).
- [ ] **Retention view:** a SQL view comparing 90-day retention of participants vs
  matched non-participants (same cohort, start month, state).
- [ ] **Demo:** a chart of that view. If real data is too thin, use a clearly labelled
  mock chart plus the SQL.
- [ ] **DevTools:** "Sync to Snowflake now".

### 4. Demo script (5 min)
1. Landing page, then sign in as the test patient (one click in DevTools).
2. Post a crisis message. It's held, the poster sees the resources, and the Slack alert
   fires with no post text in it.
3. Try to DM another patient. It's blocked.
4. Reply from a second account. Show the private notification and the weekly nudge
   preview.
5. Click "Sync to Snowflake now" and show the retention chart. Close on the 84% vs 54%
   stat.

## Before real patients (pilot gates, not for this week)

Each gate needs one named approver and a pass condition. None of them block the demo.

| Gate | What must be true | Approver |
| --- | --- | --- |
| G1 | A written escalation protocol: severity levels, an SLA for each, coverage hours with an after-hours fallback, a 911 path for an overdose in progress, and duty-to-warn / mandatory reporting | Clinical ops lead |
| G2 | A staffed on-call rota that matches G1 | Clinical ops lead |
| G3 | Clinically approved resource copy (988, 911, SAMHSA) | Medical director |
| G4 | A decision on fail-open vs fail-closed when AI triage is down. Fail-closed means every post needs approval | Clinical ops lead |
| G5 | A BAA and a 42 CFR Part 2 QSOA for the AI triage model (Azure OpenAI) | Legal |
| G6 | Every email template reviewed, and a written rule for what counts as a generic sender and subject | Privacy |
| G7 | A Part 2 review of joining forum activity to patient identity in Snowflake, plus access controls on the new tables | Legal and data owner |
| G8 | A BAA and QSOA for anything in the Snowflake pipeline that touches Part 2 data | Legal |
| G9 | DevTools and one-click test sign-in turned off in production | Eng |
| G10 | The SSO provider moved into the backend (see DISCOURSE.md, "Path to production") | Eng |
| G11 | Discharged patients logged out or suspended through `sync_sso` | Eng |
| G12 | Staff accounts for clinicians and moderators that aren't patient accounts | Eng |
| G13 | Community guidelines, terms, a voluntary-disclosure notice, and age eligibility | Legal |
| G14 | A retention and audit policy for held crisis posts and staff access, and account and post deletion | Privacy |
| G15 | Legal sign-off before any real patient is invited | Legal |
| Go/no-go | The overall pilot decision | To be named |

## Watch out
- AGENTS.md: read `node_modules/next/dist/docs/` before writing route handlers or cron
  config. This Next.js version has breaking changes.
- UI changes (DevTools buttons, the chart) must use the QuickMD tokens in DESIGN.md.
- Installing Discourse AI means a container rebuild on the VM (~10 min). Do it first,
  or drop it and demo on watched words alone.
