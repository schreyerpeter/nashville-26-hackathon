import Link from "next/link";

import { LogoMark } from "@/components/ui/logo";
import { card, link } from "@/components/ui/styles";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

type CheckState = "ok" | "pending";

function Check({ label, state, note }: { label: string; state: CheckState; note: string }) {
  return (
    <li className="flex items-start gap-sp-1.5 border-b border-border-medium py-sp-2 last:border-0">
      <span
        aria-hidden
        className={`mt-sp-0.75 size-2 shrink-0 rounded-full ${
          state === "ok" ? "bg-seafoam-50" : "bg-amber-50"
        }`}
      />
      <span className="flex-1">
        <span className="block text-scale-3 font-semibold">{label}</span>
        <span className="block text-scale-3 text-text-medium">{note}</span>
      </span>
      <span
        className={`text-scale-2 font-semibold uppercase ${
          state === "ok" ? "text-text-success" : "text-text-warning"
        }`}
      >
        {state === "ok" ? "ready" : "pending"}
      </span>
    </li>
  );
}

export default function Home() {
  const supabaseReady = isSupabaseConfigured();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-sp-5 px-sp-2 py-sp-8">
      <header className="space-y-sp-1.5">
        <LogoMark className="mb-sp-3 h-12 w-auto" />
        <p className="text-scale-2 font-semibold uppercase text-text-light">Nashville 2026</p>
        <h1 className="text-scale-8 font-semibold">Hackathon shell</h1>
        <p className="text-scale-4 text-text-medium">
          Next.js on Vercel, deploying automatically from <code>main</code>.
        </p>
      </header>

      <Link
        href="/ideas"
        className={`${card} flex items-center justify-between px-sp-2.5 py-sp-2 transition-shadow hover:border-card-border-active hover:shadow-hover-large`}
      >
        <span>
          <span className="block text-scale-4 font-semibold">Idea board</span>
          <span className="block text-scale-3 text-text-medium">
            Submit ideas, vote for favorites, and discuss them with the team.
          </span>
        </span>
        <span aria-hidden className="text-text-highlight">
          →
        </span>
      </Link>

      <ul className={`${card} px-sp-2.5`}>
        <Check
          label="Next.js app router"
          state="ok"
          note="TypeScript, Tailwind, and ESLint are configured."
        />
        <Check
          label="Continuous deployment"
          state="ok"
          note="Every push to main ships a production build."
        />
        <Check
          label="Supabase"
          state={supabaseReady ? "ok" : "pending"}
          note={
            supabaseReady
              ? "Credentials are present and the client is wired up."
              : "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to connect."
          }
        />
      </ul>

      <p className="text-scale-3 text-text-light">
        Live status:{" "}
        <a className={link} href="/api/health">
          /api/health
        </a>
      </p>
    </main>
  );
}
