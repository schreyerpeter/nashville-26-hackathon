"use client";

import { useActionState } from "react";

import { createIdea, type FormState } from "./actions";
import { DESCRIPTION_MAX, TITLE_MAX } from "./limits";
import { NameField } from "./name-field";
import { buttonClass, fieldClass } from "./styles";

const initialState: FormState = { error: null };

export function IdeaForm({ defaultName }: { defaultName: string }) {
  const [state, action, pending] = useActionState(createIdea, initialState);

  return (
    <form action={action} className="space-y-3 rounded-xl border border-black/10 p-5 dark:border-white/15">
      <h2 className="text-sm font-medium">Submit an idea</h2>
      <input
        name="title"
        required
        maxLength={TITLE_MAX}
        placeholder="A short, punchy title"
        defaultValue={state.values?.title}
        className={fieldClass}
      />
      <textarea
        name="description"
        rows={3}
        maxLength={DESCRIPTION_MAX}
        placeholder="What's the idea, and why is it worth building?"
        defaultValue={state.values?.description}
        className={`${fieldClass} resize-y`}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <NameField defaultValue={state.values?.name ?? defaultName} />
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Submitting…" : "Submit"}
        </button>
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
    </form>
  );
}
