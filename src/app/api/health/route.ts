import { NextResponse } from "next/server";

import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

type SupabaseHealth =
  | { status: "unconfigured" }
  | { status: "ok" }
  | { status: "unreachable"; detail: string };

async function checkSupabase(): Promise<SupabaseHealth> {
  if (!isSupabaseConfigured()) {
    return { status: "unconfigured" };
  }

  try {
    // The auth health endpoint answers without any tables or users existing
    // yet, which is what we want from a shell: it returns 200 only when the
    // URL resolves and the key is valid, and 401 otherwise. The PostgREST root
    // rejects publishable keys outright, so it cannot serve as a liveness probe.
    const response = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      headers: { apikey: SUPABASE_ANON_KEY },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    return response.ok
      ? { status: "ok" }
      : { status: "unreachable", detail: `HTTP ${response.status}` };
  } catch (error) {
    return {
      status: "unreachable",
      detail: error instanceof Error ? error.message : "unknown error",
    };
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: "nashville-26-hackathon",
    environment: process.env.VERCEL_ENV ?? "local",
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    supabase: await checkSupabase(),
    checkedAt: new Date().toISOString(),
  });
}
