"use server";

import { redirect } from "next/navigation";

import { pseudonym } from "@/lib/discourse/connect";
import { getSession, hasAcceptedTerms, resetTerms } from "@/lib/session";

export type Session =
  | { signedIn: false }
  | {
      signedIn: true;
      username: string;
      email: string;
      emailVerified: boolean;
      cohorts: string[];
      acceptedTerms: boolean;
    };

/** Who the app's session belongs to, as Discourse will see them. */
export async function getDevToolsSession(): Promise<Session> {
  const patient = await getSession();
  if (!patient) return { signedIn: false };
  return {
    signedIn: true,
    username: pseudonym(patient.globalKey),
    email: patient.email,
    emailVerified: patient.emailVerified,
    cohorts: patient.cohorts,
    acceptedTerms: await hasAcceptedTerms(patient),
  };
}

/** Forgets that this browser agreed to the terms, then replays the first-time modal. */
export async function resetTermsConsent() {
  await resetTerms();
  // Signed in, the sign-in page opens the terms straight away. Signed out, it asks for a
  // sign-in first and then shows them.
  redirect("/community/login");
}
