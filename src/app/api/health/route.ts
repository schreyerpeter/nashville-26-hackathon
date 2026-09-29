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
    // The REST root answers without any tables existing yet, which is what we
    // want from a shell: it proves the URL and key line up, nothing more.
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
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
