import { NextResponse, type NextRequest } from "next/server";

import { logOutOfForum } from "@/lib/discourse/connect";
import { endSession, getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

// Discourse's `logout_redirect`, and the app's own sign-out. Both sessions end together:
// otherwise the forum would sign the patient straight back in from our session, or keep
// them signed in after they signed out here.
export async function GET(request: NextRequest) {
  const patient = await getSession();
  await endSession();
  if (patient) await logOutOfForum(patient.globalKey);
  return NextResponse.redirect(new URL("/", request.url));
}
