"use server";

import { redirect } from "next/navigation";

import { DISCOURSE_URL, returnUrlFor, verifyRequest } from "@/lib/discourse/connect";
import { getPatient, login, setSessionToken } from "@/lib/quickmd/api";

export type FormState = { error: string | null; email?: string };

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = text(formData, "email");
  const password = formData.get("password");
  if (!email || typeof password !== "string" || !password) {
    return { error: "Enter your email and password.", email };
  }

  const result = await login(email, password);
  if ("error" in result) return { error: result.error ?? null, email };

  const patient = await getPatient(result.token);
  if (!patient) return { error: "That account isn't a patient account.", email };
  await setSessionToken(result.token);

  // Arriving from Discourse, finish the handshake. Arriving directly, open the forum,
  // which starts a fresh handshake that our new cookie answers without a second login.
  const connect = verifyRequest(text(formData, "sso"), text(formData, "sig"));
  redirect(connect ? returnUrlFor(connect, patient) : DISCOURSE_URL || "/");
}
