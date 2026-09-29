import Link from "next/link";

import { LockIcon, ShieldCheckIcon, UserIcon } from "@/components/ui/icons";
import { Logo, LogoMark } from "@/components/ui/logo";
import { banner, heading, paragraph } from "@/components/ui/styles";
import { isDiscourseConfigured } from "@/lib/discourse/connect";
import { isQuickmdConfigured } from "@/lib/quickmd/api";
import { getSession, hasAcceptedTerms } from "@/lib/session";

import { LoginForm } from "./login-form";
import { TermsModal } from "./terms-modal";

export const dynamic = "force-dynamic";

const reassurances = [
  { Icon: ShieldCheckIcon, text: "Only QuickMD patients" },
  { Icon: UserIcon, text: "Private username" },
  { Icon: LockIcon, text: "Your name is never shared" },
];

export default async function CommunityLogin({ searchParams }: PageProps<"/community/login">) {
  const { sso, sig } = await searchParams;
  const ready = isDiscourseConfigured() && isQuickmdConfigured();
  const setup = banner("warning");
  const signedIn = banner("informative");
  const patient = await getSession();
  // Signed in but new here: agree to the terms before the handshake goes back to the forum.
  const needsTerms = patient !== null && !(await hasAcceptedTerms(patient));
  const params = { sso: typeof sso === "string" ? sso : "", sig: typeof sig === "string" ? sig : "" };

  // patient-web's AuthLayout: one white card, centered, with the full logo on top. The
  // backdrop and the reassurance row underneath are ours.
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-linear-to-b from-coastal-blue-10 via-frost-20 to-app-background p-sp-2 lg:p-sp-4">
      <LogoMark
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-sp-16 -left-sp-12 hidden h-sp-80 w-auto opacity-5 lg:block"
      />
      <div className="relative grid w-full gap-sp-3 md:max-w-sp-64 lg:max-w-sp-80">
        <div className="grid gap-sp-2 rounded-larger border border-border-medium bg-surface-default p-sp-3 shadow-float-small lg:p-sp-4">
          <Link href="/" aria-label="QuickMD Together home" className="mx-auto">
            <Logo size="m" />
          </Link>

          <div className="grid gap-sp-1 text-center">
            <h1 className={heading.h2}>Log in to QuickMD Together</h1>
            <p className={paragraph.md}>
              Use your QuickMD account. Other members only see a private username, never your name.
            </p>
          </div>

          {needsTerms ? (
            // Behind the terms popup, so there's no sign-in form for someone already signed in.
            <div className={signedIn.box}>
              <p className={signedIn.title}>You&apos;re signed in</p>
              <p className={signedIn.text}>Agree to the terms to open QuickMD Together.</p>
            </div>
          ) : ready ? (
            <LoginForm {...params} />
          ) : (
            <div className={setup.box}>
              <p className={setup.title}>Sign-in isn&apos;t set up yet</p>
              <p className={setup.text}>
                Set QUICKMD_API_URL, DISCOURSE_URL, and DISCOURSE_CONNECT_SECRET to turn on community
                sign-in.
              </p>
            </div>
          )}
        </div>

        <ul className="flex flex-wrap justify-center gap-x-sp-3 gap-y-sp-1 text-scale-3 text-text-medium">
          {reassurances.map(({ Icon, text }) => (
            <li key={text} className="flex items-center gap-sp-1">
              <Icon className="size-4 text-coastal-blue-50" />
              {text}
            </li>
          ))}
        </ul>
      </div>
      {needsTerms && <TermsModal {...params} />}
    </main>
  );
}
