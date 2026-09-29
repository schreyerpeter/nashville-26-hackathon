import { NextResponse, type NextRequest } from "next/server";

import { clearSessionToken } from "@/lib/quickmd/api";

export const dynamic = "force-dynamic";

// Discourse's `logout_redirect`. Without this the forum would sign the patient
// straight back in from our cookie the next time they click "Log in".
export async function GET(request: NextRequest) {
  await clearSessionToken();
  return NextResponse.redirect(new URL("/", request.url));
}
