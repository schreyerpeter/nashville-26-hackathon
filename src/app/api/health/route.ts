import { NextResponse } from "next/server";

import { isDiscourseConfigured } from "@/lib/discourse/connect";
import { isQuickmdConfigured } from "@/lib/quickmd/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: "nashville-26-hackathon",
    environment: process.env.VERCEL_ENV ?? "local",
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    discourse: isDiscourseConfigured(),
    quickmdApi: isQuickmdConfigured(),
    checkedAt: new Date().toISOString(),
  });
}
