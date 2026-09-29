import { createHmac, timingSafeEqual } from "node:crypto";

import type { Patient } from "@/lib/quickmd/api";

// DiscourseConnect: Discourse sends the browser here with a signed `sso` payload,
// and we send it back with a signed payload describing the patient.
// Spec: https://meta.discourse.org/t/discourseconnect-official-single-sign-on-for-discourse-sso/13045
export const DISCOURSE_URL = process.env.DISCOURSE_URL ?? "";
const SECRET = process.env.DISCOURSE_CONNECT_SECRET ?? "";

export type ConnectRequest = { nonce: string; returnUrl: string };

export function isDiscourseConfigured() {
  return DISCOURSE_URL.length > 0 && SECRET.length > 0;
}

function sign(payload: string) {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

function sameOrigin(url: string, expected: string) {
  try {
    return new URL(url).origin === new URL(expected).origin;
  } catch {
    return false;
  }
}

/**
 * Checks Discourse's signature and pulls out the nonce and return URL. Returns null for
 * anything forged, malformed, or asking us to send a signed identity somewhere other
 * than our Discourse. Discourse checks the nonce itself when the payload comes back.
 */
export function verifyRequest(sso: string | null, sig: string | null): ConnectRequest | null {
  if (!isDiscourseConfigured() || !sso || !sig) return null;

  const expected = Buffer.from(sign(sso), "hex");
  const given = Buffer.from(sig, "hex");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;

  const params = new URLSearchParams(Buffer.from(sso, "base64").toString("utf8"));
  const nonce = params.get("nonce");
  const returnUrl = params.get("return_sso_url");
  if (!nonce || !returnUrl || !sameOrigin(returnUrl, DISCOURSE_URL)) return null;
  return { nonce, returnUrl };
}

/** A stable handle that never reveals who the patient is, e.g. `patient-3f9a0c1d`. */
function pseudonym(globalKey: string) {
  return `patient-${createHmac("sha256", SECRET).update(`username:${globalKey}`).digest("hex").slice(0, 8)}`;
}

/** Discourse only syncs groups an admin has already created, matched by lowercase name. */
function groupName(cohort: string) {
  return cohort.toLowerCase().replace(/[^a-z0-9_]+/g, "_");
}

/** The URL that logs the patient into Discourse. */
export function returnUrlFor(request: ConnectRequest, patient: Patient) {
  const payload = Buffer.from(
    new URLSearchParams({
      nonce: request.nonce,
      external_id: patient.globalKey,
      email: patient.email,
      username: pseudonym(patient.globalKey),
      require_activation: String(!patient.emailVerified),
      suppress_welcome_message: "true",
      groups: ["patients", ...patient.cohorts.map(groupName)].join(","),
    }).toString(),
  ).toString("base64");

  const url = new URL(request.returnUrl);
  url.searchParams.set("sso", payload);
  url.searchParams.set("sig", sign(payload));
  return url.toString();
}
