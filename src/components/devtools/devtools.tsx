"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

import { signInAsDemoPatient } from "@/app/community/login/actions";
import { button, card, link, tab as tabClass, tablist } from "@/components/ui/styles";

import { getDevToolsSession, type Session } from "./actions";

// A slimmed-down port of the design system's DevTools (features/devTools): the same
// floating panel, with a Demo tab in place of the console, network, and storage panels,
// which the browser's own devtools already cover. Always on, since this app is a demo.

export type DevToolsProps = {
  environment: Record<string, string>;
  forumUrl: string;
  docUrl: string;
  mailUrl: string | null;
  demoPatientEmail: string | null;
};

type Tab = "demo" | "environment";

export function DevTools(props: DevToolsProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("demo");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Open DevTools"
        aria-label="Open DevTools"
        className="fixed bottom-sp-2 right-sp-2 z-fixed flex size-sp-6 cursor-pointer items-center justify-center rounded-full bg-deep-navy-80 text-text-inverse shadow-hover-large transition-transform hover:scale-110"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      </button>
    );
  }

  return (
    <section
      aria-label="Developer Tools"
      className={`${card} fixed bottom-sp-2 right-sp-2 z-fixed flex max-h-sp-64 w-sp-48 max-w-full flex-col overflow-hidden shadow-float-small`}
    >
      <header className="flex items-center justify-between bg-deep-navy-80 px-sp-1.5 py-sp-1">
        <span className="text-scale-2 font-semibold uppercase text-text-inverse">DevTools</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          title="Close DevTools"
          aria-label="Close DevTools"
          className="cursor-pointer px-sp-0.5 text-scale-4 text-text-inverse"
        >
          ×
        </button>
      </header>
      <nav className={`${tablist} px-sp-1.5`}>
        {(["demo", "environment"] as const).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setTab(name)}
            aria-pressed={tab === name}
            className={`${tabClass(tab === name)} capitalize`}
          >
            {name}
          </button>
        ))}
      </nav>
      <div className="overflow-y-auto p-sp-1.5">
        {tab === "demo" ? <DemoTab {...props} /> : <EnvironmentTab environment={props.environment} />}
      </div>
    </section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-sp-0.75 border-b border-border-medium pb-sp-1.5 last:border-0 last:pb-0">
      <h3 className="text-scale-2 font-semibold uppercase text-text-light">{title}</h3>
      {children}
    </div>
  );
}

function DemoTab({ forumUrl, docUrl, mailUrl, demoPatientEmail, environment }: DevToolsProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(() => {
    getDevToolsSession().then(setSession, () => setSession({ signedIn: false }));
  }, []);
  useEffect(refresh, [refresh]);

  function signInAsTestPatient() {
    // On the sign-in page, finish the handshake Discourse started; anywhere else, open the forum.
    const params = new URLSearchParams(window.location.search);
    startTransition(async () => {
      const result = await signInAsDemoPatient(params.get("sso") ?? "", params.get("sig") ?? "");
      setError(result.error);
    });
  }

  return (
    <div className="space-y-sp-1.5 text-scale-3">
      <Section title="Session">
        {session === null ? (
          <p className="text-text-light">Checking…</p>
        ) : session.signedIn ? (
          <>
            <p>
              Signed in as <span className="font-semibold">{session.username}</span>
            </p>
            <p className="break-all text-text-medium">
              {session.email} · email {session.emailVerified ? "verified" : "not verified"}
            </p>
            <p className="text-text-medium">
              Groups: patients{session.cohorts.length > 0 && `, ${session.cohorts.join(", ")}`}
            </p>
          </>
        ) : (
          <p className="text-text-medium">
            Not signed in. Opening the forum will ask for a QuickMD sign-in.
          </p>
        )}
        <div className="flex flex-wrap gap-sp-1 pt-sp-0.5">
          {session?.signedIn && (
            <a href="/api/discourse/logout" className={button("secondary", "s")}>
              Sign out everywhere
            </a>
          )}
          <button type="button" onClick={refresh} className={button("tertiary", "s")}>
            Refresh
          </button>
        </div>
      </Section>

      <Section title="Test patient">
        {demoPatientEmail ? (
          <>
            <p className="text-text-medium">
              <span className="break-all">{demoPatientEmail}</span>, the shared Playwright patient on gimli.
              The password stays on the server.
            </p>
            <button
              type="button"
              onClick={signInAsTestPatient}
              disabled={pending}
              className={`${button("primary", "s")} w-full`}
            >
              {pending ? "Signing in…" : "Sign in as test patient"}
            </button>
            {error && (
              <p role="alert" className="text-text-error">
                {error}
              </p>
            )}
          </>
        ) : (
          <p className="text-text-medium">Set DEMO_PATIENT_EMAIL and DEMO_PATIENT_PASSWORD to enable.</p>
        )}
      </Section>

      <Section title="Good to know">
        <ul className="list-disc space-y-sp-0.5 pl-sp-2 text-text-medium">
          <li>
            Only gimli accounts work: sign-in calls{" "}
            <span className="break-all">{environment["Patient API"] || "the patient-web API"}</span>.
          </li>
          <li>The forum gets a pseudonym. The same patient always gets the same one.</li>
          <li>
            Patients with an unverified email get a confirmation email first. Locally it lands in
            Mailpit.
          </li>
          <li>
            The app and the forum each keep a session for up to 30 days. Signing out of either one
            signs you out of both.
          </li>
        </ul>
      </Section>

      <Section title="Links">
        <div className="flex flex-wrap gap-x-sp-2 gap-y-sp-0.5">
          {forumUrl && (
            <a href={forumUrl} className={link}>
              Open the forum
            </a>
          )}
          <a href="/community/login" className={link}>
            Sign-in page
          </a>
          {mailUrl && (
            <a href={mailUrl} target="_blank" rel="noreferrer" className={link}>
              Mailpit
            </a>
          )}
          <a href={docUrl} target="_blank" rel="noreferrer" className={link}>
            How it&apos;s wired
          </a>
        </div>
      </Section>
    </div>
  );
}

function EnvironmentTab({ environment }: { environment: Record<string, string> }) {
  return (
    <dl className="space-y-sp-1 text-scale-3">
      {Object.entries(environment).map(([key, value]) => (
        <div key={key}>
          <dt className="text-scale-2 font-semibold uppercase text-text-light">{key}</dt>
          <dd className="break-all">{value || "not set"}</dd>
        </div>
      ))}
    </dl>
  );
}
