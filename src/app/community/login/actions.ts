"use server";

import { redirect } from "next/navigation";

import { DISCOURSE_URL, returnUrlFor, verifyRequest } from "@/lib/discourse/connect";
import {
  DEMO_PATIENT_EMAIL,
  DEMO_PATIENT_PASSWORD,
  getPatient,
  login,
} from "@/lib/quickmd/api";
import { startSession } from "@/lib/session";

export type FormState = { error: string | null; email?: string };

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

async function signInWith(email: string, password: string, sso: string, sig: string): Promise<FormState> {
  const result = await login(email, password);
  if ("error" in result) return { error: result.error ?? null, email };

  const patient = await getPatient(result.token);
  if (!patient) return { error: "That account isn't a patient account.", email };
  await startSession(patient);

  // Arriving from Discourse, finish the handshake. Arriving directly, open the forum,
  // which starts a fresh handshake that our new cookie answers without a second login.
  const connect = verifyRequest(sso, sig);
  redirect(connect ? returnUrlFor(connect, patient) : DISCOURSE_URL || "/");
}

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = text(formData, "email");
  const password = formData.get("password");
  if (!email || typeof password !== "string" || !password) {
    return { error: "Enter your email and password.", email };
  }
  return signInWith(email, password, text(formData, "sso"), text(formData, "sig"));
}

/** DevTools' one-click sign-in as the shared gimli test patient. */
export async function signInAsDemoPatient(sso: string, sig: string): Promise<FormState> {
  if (!DEMO_PATIENT_EMAIL || !DEMO_PATIENT_PASSWORD) {
    return { error: "Set DEMO_PATIENT_EMAIL and DEMO_PATIENT_PASSWORD to turn this on." };
  }
  return signInWith(DEMO_PATIENT_EMAIL, DEMO_PATIENT_PASSWORD, sso, sig);
}
