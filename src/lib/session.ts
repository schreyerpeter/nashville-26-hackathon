import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

import type { Patient } from "@/lib/quickmd/api";

// The app's own sign-in session, like any identity provider's. It can't be the Stytch
// JWT: that dies after 60 minutes while Discourse keeps its session for weeks, so the
// app would forget a patient the forum still shows as signed in. Instead we keep the
// patient we looked up at sign-in, signed so the browser can't edit it.
const SESSION_COOKIE = "qmd_patient_session";
const SESSION_DAYS = 30;
const SECRET = process.env.DISCOURSE_CONNECT_SECRET ?? "";

type Stored = Patient & { expiresAt: number };

function sign(value: string) {
  // Prefixed so a session signature can never double as a DiscourseConnect one.
  return createHmac("sha256", SECRET).update(`session:${value}`).digest("base64url");
}

export async function getSession(): Promise<Patient | null> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw || !SECRET) return null;

  const [value, sig] = raw.split(".");
  const expected = Buffer.from(sign(value ?? ""));
  const given = Buffer.from(sig ?? "");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;

  const { expiresAt, ...patient } = JSON.parse(Buffer.from(value, "base64url").toString()) as Stored;
  return expiresAt > Date.now() ? patient : null;
}

/** Only callable from Server Actions and Route Handlers. */
export async function startSession(patient: Patient) {
  const stored: Stored = { ...patient, expiresAt: Date.now() + SESSION_DAYS * 86_400_000 };
  const value = Buffer.from(JSON.stringify(stored)).toString("base64url");
  (await cookies()).set(SESSION_COOKIE, `${value}.${sign(value)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DAYS * 86_400,
    path: "/",
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
