"use client";

/** A submit button that asks before letting its form go through. */
export function ConfirmButton({ message, children }: { message: string; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      className="underline-offset-4 hover:text-red-600 hover:underline dark:hover:text-red-400"
    >
      {children}
    </button>
  );
}
