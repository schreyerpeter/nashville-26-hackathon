"use client";

import { useActionState } from "react";

import { button, card, field } from "@/components/ui/styles";

import { createIdea, type FormState } from "./actions";
import { DESCRIPTION_MAX, TITLE_MAX } from "./limits";
import { NameField } from "./name-field";

const initialState: FormState = { error: null };

export function IdeaForm({ defaultName }: { defaultName: string }) {
  const [state, action, pending] = useActionState(createIdea, initialState);

  return (
    <form action={action} className={`${card} space-y-sp-1.5 p-sp-2.5`}>
      <h2 className="text-scale-4 font-semibold">Submit an idea</h2>
      <input
        name="title"
        required
        maxLength={TITLE_MAX}
        placeholder="A short, punchy title"
        defaultValue={state.values?.title}
        className={`${field} h-11`}
      />
      <textarea
        name="description"
        rows={3}
        maxLength={DESCRIPTION_MAX}
        placeholder="What's the idea, and why is it worth building?"
        defaultValue={state.values?.description}
        className={`${field} resize-y`}
      />
      <div className="flex flex-wrap items-center justify-between gap-sp-1.5">
        <NameField defaultValue={state.values?.name ?? defaultName} />
        <button type="submit" disabled={pending} className={button()}>
          {pending ? "Submitting…" : "Submit"}
        </button>
      </div>
      {state.error && (
        <p role="alert" className="text-scale-3 text-text-error">
          {state.error}
        </p>
      )}
    </form>
  );
}
