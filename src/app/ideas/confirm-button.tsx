"use client";

/** A submit button that asks before letting its form go through. */
export function ConfirmButton({ message, children }: { message: string; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      className="cursor-pointer underline-offset-4 hover:text-text-error hover:underline"
    >
      {children}
    </button>
  );
}
