import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

type CheckState = "ok" | "pending";

function Check({ label, state, note }: { label: string; state: CheckState; note: string }) {
  return (
    <li className="flex items-start gap-3 border-b border-black/10 py-4 last:border-0 dark:border-white/15">
      <span
        aria-hidden
        className={`mt-1.5 size-2 shrink-0 rounded-full ${
          state === "ok" ? "bg-emerald-500" : "bg-amber-500"
        }`}
      />
      <span className="flex-1">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-sm text-black/60 dark:text-white/60">{note}</span>
      </span>
      <span className="text-xs uppercase tracking-wide text-black/40 dark:text-white/40">
        {state === "ok" ? "ready" : "pending"}
      </span>
    </li>
  );
}

export default function Home() {
  const supabaseReady = isSupabaseConfigured();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-10 px-4 py-16">
      <header className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-black/50 dark:text-white/50">
          Nashville 2026
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Hackathon shell</h1>
        <p className="text-black/60 dark:text-white/60">
          Next.js on Vercel, deploying automatically from <code>main</code>. Nothing is
          built on top of it yet.
        </p>
      </header>

      <ul className="rounded-xl border border-black/10 px-5 dark:border-white/15">
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

      <p className="text-sm text-black/50 dark:text-white/50">
        Live status:{" "}
        <a className="underline underline-offset-4" href="/api/health">
          /api/health
        </a>
      </p>
    </main>
  );
}
