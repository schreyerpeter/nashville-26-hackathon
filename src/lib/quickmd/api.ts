// Patients sign in against the same patient-web API that doctorvisit.quick.md uses.
// Point this at a dev environment, e.g. https://patient-web-api.gimli.quickmd.dev/
export const QUICKMD_API_URL = process.env.QUICKMD_API_URL ?? "";

// The shared gimli test patient from patient-web's Playwright config, for DevTools' one-click
// sign-in. Server-only, so the password never reaches the browser.
export const DEMO_PATIENT_EMAIL = process.env.DEMO_PATIENT_EMAIL ?? "";
export const DEMO_PATIENT_PASSWORD = process.env.DEMO_PATIENT_PASSWORD ?? "";

export type Patient = {
  globalKey: string;
  email: string;
  emailVerified: boolean;
  cohorts: string[];
};

export function isQuickmdConfigured() {
  return QUICKMD_API_URL.length > 0;
}

function endpoint(path: string) {
  return new URL(path, QUICKMD_API_URL);
}

/** Exchanges an email and password for a session token, or explains why it couldn't. */
export async function login(email: string, password: string) {
  const response = await fetch(endpoint("api/v2/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ Email: email, Password: password }),
    cache: "no-store",
  });
  const body = await response.json().catch(() => null);
  if (response.ok && body?.AccessToken) return { token: body.AccessToken as string };
  if (body?.ErrorCode === "CredentialsNotValid") return { error: "That email and password don't match." };
  return { error: "Couldn't sign you in. Try again." };
}

/** Looks up the patient behind a session token. Returns null when the token is missing or expired. */
export async function getPatient(token: string | undefined): Promise<Patient | null> {
  if (!token) return null;
  const response = await fetch(endpoint("api/v1/profile"), {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error(`QuickMD profile lookup failed: ${response.status}`);

  const profile = await response.json();
  if (!profile.PatientId || !profile.Email) return null;
  return {
    globalKey: profile.PatientId,
    email: profile.Email,
    emailVerified: profile.IsEmailVerified === true,
    cohorts: profile.Cohorts ?? [],
  };
}
