"use server";

import { pseudonym } from "@/lib/discourse/connect";
import { getSession } from "@/lib/session";

export type Session =
  | { signedIn: false }
  | { signedIn: true; username: string; email: string; emailVerified: boolean; cohorts: string[] };

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
  };
}
