import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

import type { Patient } from "@/lib/quickmd/api";
import { TERMS_VERSION } from "@/lib/terms";

// The app's own sign-in session, like any identity provider's. It can't be the Stytch
// JWT: that dies after 60 minutes while Discourse keeps its session for weeks, so the
// app would forget a patient the forum still shows as signed in. Instead we keep the
// patient we looked up at sign-in, signed so the browser can't edit it.
const SESSION_COOKIE = "qmd_patient_session";
const SESSION_DAYS = 30;
// Which patient agreed to which version of the terms. Kept apart from the session so
// signing out and back in doesn't ask again.
const TERMS_COOKIE = "qmd_terms_consent";
const TERMS_DAYS = 365;
const SECRET = process.env.DISCOURSE_CONNECT_SECRET ?? "";

type Stored = Patient & { expiresAt: number };

function sign(purpose: "session" | "terms", value: string) {
  // Prefixed so no signature can double as another cookie's or a DiscourseConnect one.
  return createHmac("sha256", SECRET).update(`${purpose}:${value}`).digest("base64url");
}

/** The value of a `value.signature` cookie, or null when it's missing or was edited. */
async function readSigned(name: string, purpose: "session" | "terms") {
  const raw = (await cookies()).get(name)?.value;
  if (!raw || !SECRET) return null;

  const dot = raw.lastIndexOf(".");
  const value = raw.slice(0, dot);
  const expected = Buffer.from(sign(purpose, value));
  const given = Buffer.from(raw.slice(dot + 1));
  if (dot < 0 || given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  return value;
}

async function writeSigned(name: string, purpose: "session" | "terms", value: string, days: number) {
  (await cookies()).set(name, `${value}.${sign(purpose, value)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: days * 86_400,
    path: "/",
  });
}

export async function getSession(): Promise<Patient | null> {
  const value = await readSigned(SESSION_COOKIE, "session");
  if (!value) return null;

  const { expiresAt, ...patient } = JSON.parse(Buffer.from(value, "base64url").toString()) as Stored;
  return expiresAt > Date.now() ? patient : null;
}

/** Only callable from Server Actions and Route Handlers. */
export async function startSession(patient: Patient) {
  const stored: Stored = { ...patient, expiresAt: Date.now() + SESSION_DAYS * 86_400_000 };
  const value = Buffer.from(JSON.stringify(stored)).toString("base64url");
  await writeSigned(SESSION_COOKIE, "session", value, SESSION_DAYS);
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Whether this patient agreed to the current terms in this browser. */
export async function hasAcceptedTerms(patient: Patient) {
  return (await readSigned(TERMS_COOKIE, "terms")) === `${patient.globalKey}:${TERMS_VERSION}`;
}

/** Only callable from Server Actions and Route Handlers. */
export async function acceptTerms(patient: Patient) {
  await writeSigned(TERMS_COOKIE, "terms", `${patient.globalKey}:${TERMS_VERSION}`, TERMS_DAYS);
}

/** Forgets the agreement, so the next trip into the forum asks again. */
export async function resetTerms() {
  (await cookies()).delete(TERMS_COOKIE);
}
