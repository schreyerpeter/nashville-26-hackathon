"use client";

import { useActionState } from "react";

import { button, field } from "@/components/ui/styles";

import { addComment, type FormState } from "./actions";
import { COMMENT_MAX } from "./limits";
import { NameField } from "./name-field";

const initialState: FormState = { error: null };

export function CommentForm({ ideaId, defaultName }: { ideaId: string; defaultName: string }) {
  const [state, action, pending] = useActionState(addComment, initialState);

  return (
    <form action={action} className="space-y-sp-1.5">
      <input type="hidden" name="idea_id" value={ideaId} />
      <textarea
        name="body"
        required
        rows={3}
        maxLength={COMMENT_MAX}
        placeholder="Add a comment"
        defaultValue={state.values?.body}
        className={`${field} resize-y`}
      />
      <div className="flex flex-wrap items-center justify-between gap-sp-1.5">
        <NameField defaultValue={state.values?.name ?? defaultName} />
        <button type="submit" disabled={pending} className={button()}>
          {pending ? "Posting…" : "Comment"}
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
