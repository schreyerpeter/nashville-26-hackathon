import Link from "next/link";

import { Logo } from "@/components/ui/logo";
import { banner, heading, paragraph } from "@/components/ui/styles";
import { isDiscourseConfigured } from "@/lib/discourse/connect";
import { isQuickmdConfigured } from "@/lib/quickmd/api";

import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function CommunityLogin({ searchParams }: PageProps<"/community/login">) {
  const { sso, sig } = await searchParams;
  const ready = isDiscourseConfigured() && isQuickmdConfigured();
  const setup = banner("warning");

  // patient-web's AuthLayout: one white card, centered, with the full logo on top.
  return (
    <main className="flex min-h-dvh items-center justify-center p-sp-2 lg:p-sp-4">
      <div className="grid w-full gap-sp-2 rounded-large bg-surface-default p-sp-2 md:max-w-sp-64 lg:max-w-sp-80 lg:p-sp-3">
        <Link href="/" aria-label="QuickMD Together home" className="mx-auto">
          <Logo size="m" />
        </Link>

        <div className="grid gap-sp-1 text-center">
          <h1 className={heading.h2}>Log in to QuickMD Together</h1>
          <p className={paragraph.md}>
            Use your QuickMD account. Other members only see a private username, never your name.
          </p>
        </div>

        {ready ? (
          <LoginForm sso={typeof sso === "string" ? sso : ""} sig={typeof sig === "string" ? sig : ""} />
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
    </main>
  );
}
