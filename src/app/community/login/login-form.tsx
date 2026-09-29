"use client";

import { useActionState } from "react";

import { button, card, field } from "@/components/ui/styles";

import { signIn, type FormState } from "./actions";

const initialState: FormState = { error: null };

export function LoginForm({ sso, sig }: { sso: string; sig: string }) {
  const [state, action, pending] = useActionState(signIn, initialState);

  return (
    <form action={action} className={`${card} space-y-sp-1.5 p-sp-2.5`}>
      <input type="hidden" name="sso" value={sso} />
      <input type="hidden" name="sig" value={sig} />
      <label className="block space-y-sp-0.5">
        <span className="text-scale-3 font-semibold">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={state.email}
          aria-invalid={state.error ? true : undefined}
          className={`${field} h-11`}
        />
      </label>
      <label className="block space-y-sp-0.5">
        <span className="text-scale-3 font-semibold">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          aria-invalid={state.error ? true : undefined}
          className={`${field} h-11`}
        />
      </label>
      {state.error && (
        <p role="alert" className="text-scale-3 text-text-error">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={`${button()} w-full`}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
