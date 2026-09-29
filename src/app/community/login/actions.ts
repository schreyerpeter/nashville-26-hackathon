"use server";

import { redirect } from "next/navigation";

import { DISCOURSE_URL, returnUrlFor, verifyRequest } from "@/lib/discourse/connect";
import {
  DEMO_PATIENT_EMAIL,
  DEMO_PATIENT_PASSWORD,
  getPatient,
  login,
} from "@/lib/quickmd/api";
import type { Patient } from "@/lib/quickmd/api";
import { acceptTerms, endSession, getSession, hasAcceptedTerms, startSession } from "@/lib/session";

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

  // First time in: back to this page, which now shows the terms instead of the form.
  if (!(await hasAcceptedTerms(patient))) redirect(`/community/login?${new URLSearchParams({ sso, sig })}`);
  enterForum(patient, sso, sig);
}

function enterForum(patient: Patient, sso: string, sig: string): never {
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

/** The terms modal's "I agree": remember it, then carry on into the forum. */
export async function agreeToTerms(formData: FormData) {
  const patient = await getSession();
  if (!patient) redirect("/community/login");
  await acceptTerms(patient);
  enterForum(patient, text(formData, "sso"), text(formData, "sig"));
}

/** The terms modal's way out. Nobody stays signed in without agreeing. */
export async function declineTerms() {
  await endSession();
  redirect("/");
}
