import Link from "next/link";

import { LogoMark } from "@/components/ui/logo";
import { card } from "@/components/ui/styles";
import { isDiscourseConfigured } from "@/lib/discourse/connect";
import { isQuickmdConfigured } from "@/lib/quickmd/api";

import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function CommunityLogin({ searchParams }: PageProps<"/community/login">) {
  const { sso, sig } = await searchParams;
  const ready = isDiscourseConfigured() && isQuickmdConfigured();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-sp-4 px-sp-2 py-sp-8">
      <header className="space-y-sp-1.5">
        <Link href="/" aria-label="Home">
          <LogoMark className="mb-sp-2 h-10 w-auto" />
        </Link>
        <h1 className="text-scale-7 font-semibold">QuickMD Community</h1>
        <p className="text-scale-4 text-text-medium">
          Sign in with your QuickMD account. Other members only see a private username, never your
          name.
        </p>
      </header>
      {ready ? (
        <LoginForm sso={typeof sso === "string" ? sso : ""} sig={typeof sig === "string" ? sig : ""} />
      ) : (
        <p className={`${card} px-sp-2.5 py-sp-2 text-scale-3 text-text-medium`}>
          Set QUICKMD_API_URL, DISCOURSE_URL, and DISCOURSE_CONNECT_SECRET to turn on community
          sign-in.
        </p>
      )}
    </main>
  );
}
