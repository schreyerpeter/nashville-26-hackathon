"use client";

import { useActionState } from "react";

import { addComment, type FormState } from "./actions";
import { COMMENT_MAX } from "./limits";
import { NameField } from "./name-field";
import { buttonClass, fieldClass } from "./styles";

const initialState: FormState = { error: null };

export function CommentForm({ ideaId, defaultName }: { ideaId: string; defaultName: string }) {
  const [state, action, pending] = useActionState(addComment, initialState);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="idea_id" value={ideaId} />
      <textarea
        name="body"
        required
        rows={3}
        maxLength={COMMENT_MAX}
        placeholder="Add a comment"
        defaultValue={state.values?.body}
        className={`${fieldClass} resize-y`}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <NameField defaultValue={state.values?.name ?? defaultName} />
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Posting…" : "Comment"}
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
