import { cookies } from "next/headers";

// There's no sign-in. A random token in an httpOnly cookie stands in for the
// visitor: it records their votes and lets them delete what they posted.
const TOKEN_COOKIE = "idea_board_visitor";
const NAME_COOKIE = "idea_board_name";
const ONE_YEAR = 60 * 60 * 24 * 365;
const COOKIE_OPTIONS = {
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: ONE_YEAR,
  path: "/",
} as const;

export type Visitor = { token: string | null; name: string };

/** Reads the visitor without creating one, for rendering pages. */
export async function getVisitor(): Promise<Visitor> {
  const store = await cookies();
  return {
    token: store.get(TOKEN_COOKIE)?.value ?? null,
    name: store.get(NAME_COOKIE)?.value ?? "",
  };
}

/** Returns the visitor's token, issuing one first. Only callable from Server Actions. */
export async function ensureVisitorToken() {
  const store = await cookies();
  const existing = store.get(TOKEN_COOKIE)?.value;
  if (existing) return existing;

  const token = crypto.randomUUID();
  store.set(TOKEN_COOKIE, token, { ...COOKIE_OPTIONS, httpOnly: true });
  return token;
}

/** Remembers the name someone posted under so the forms can prefill it. */
export async function rememberName(name: string) {
  const store = await cookies();
  store.set(NAME_COOKIE, name, COOKIE_OPTIONS);
}
