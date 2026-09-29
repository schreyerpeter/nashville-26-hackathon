"use client";

import { useActionState } from "react";

import { button, errorMessage, field, formField, label } from "@/components/ui/styles";

import { signIn, type FormState } from "./actions";

const initialState: FormState = { error: null };

// patient-web's LoginForm: label, then any error, then the input, and the API error shown
// on the password field.
export function LoginForm({ sso, sig }: { sso: string; sig: string }) {
  const [state, action, pending] = useActionState(signIn, initialState);
  const invalid = state.error ? true : undefined;

  return (
    <form action={action} className="grid gap-sp-2">
      <input type="hidden" name="sso" value={sso} />
      <input type="hidden" name="sig" value={sig} />

      <div className={formField}>
        <label data-slot="label" htmlFor="email" className={label.lg}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Enter your email"
          defaultValue={state.email}
          disabled={pending}
          className={field}
        />
      </div>

      <div className={formField}>
        <label data-slot="label" htmlFor="password" className={label.lg}>
          Password
        </label>
        {state.error && (
          <p id="password-error" role="alert" className={errorMessage}>
            {state.error}
          </p>
        )}
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Enter your password"
          aria-invalid={invalid}
          aria-describedby={invalid && "password-error"}
          disabled={pending}
          className={field}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className={`${button("primary", "m", { loading: pending })} mt-sp-1 w-full`}
      >
        {pending ? "Logging in…" : "Continue"}
      </button>
    </form>
  );
}
