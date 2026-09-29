import { NextResponse, type NextRequest } from "next/server";

import { returnUrlFor, verifyRequest } from "@/lib/discourse/connect";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

// Discourse's `discourse_connect_url`. A patient with a session goes straight back to the
// forum; anyone else signs in first and the login action finishes the handshake.
export async function GET(request: NextRequest) {
  const sso = request.nextUrl.searchParams.get("sso");
  const sig = request.nextUrl.searchParams.get("sig");
  const connect = verifyRequest(sso, sig);
  if (!connect) return new NextResponse("Invalid DiscourseConnect request.", { status: 400 });

  const patient = await getSession();
  if (patient) return NextResponse.redirect(returnUrlFor(connect, patient));

  const login = new URL("/community/login", request.url);
  login.searchParams.set("sso", sso!);
  login.searchParams.set("sig", sig!);
  return NextResponse.redirect(login);
}
