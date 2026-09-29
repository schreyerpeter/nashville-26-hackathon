"use server";

import { pseudonym } from "@/lib/discourse/connect";
import { getPatient, getSessionToken } from "@/lib/quickmd/api";

export type Session =
  | { signedIn: false }
  | { signedIn: true; username: string; email: string; emailVerified: boolean; cohorts: string[] };

/** Who the app's session cookie belongs to, as Discourse will see them. */
export async function getSession(): Promise<Session> {
  const patient = await getPatient(await getSessionToken()).catch(() => null);
  if (!patient) return { signedIn: false };
  return {
    signedIn: true,
    username: pseudonym(patient.globalKey),
    email: patient.email,
    emailVerified: patient.emailVerified,
    cohorts: patient.cohorts,
  };
}
