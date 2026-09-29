// Class recipes ported from ~/quickmd/design-system/src/components. Reuse these before
// writing new classes for the same element, so every screen matches QuickMD's apps.

type Priority = "primary" | "secondary" | "tertiary";
type Size = "s" | "m";

const buttonPriority: Record<Priority, string> = {
  primary:
    "border-coastal-blue-50 bg-coastal-blue-50 text-white hover:border-coastal-blue-60 hover:bg-coastal-blue-60 focus-visible:border-neutral-95 active:border-coastal-blue-80 active:bg-coastal-blue-80 disabled:border-transparent disabled:bg-shade-50",
  secondary:
    "border-coastal-blue-40 bg-coastal-blue-10 text-coastal-blue-50 hover:bg-coastal-blue-20 focus-visible:border-neutral-95 focus-visible:bg-coastal-blue-20 active:border-border-medium active:bg-coastal-blue-30 active:text-coastal-blue-80 disabled:border-border-medium disabled:bg-surface-disabled disabled:text-shade-50",
  tertiary:
    "border-transparent text-deep-navy-80 hover:text-coastal-blue-50 focus-visible:border-neutral-95 focus-visible:text-coastal-blue-50 active:text-coastal-blue-80 disabled:text-text-disabled",
};

const buttonSize: Record<Size, string> = {
  s: "h-8 px-sp-2 text-scale-3",
  m: "h-11 px-sp-2 text-scale-4",
};

/** The DS `Button`: a pill with primary, secondary, and tertiary priorities. */
export function button(priority: Priority = "primary", size: Size = "m") {
  return `inline-flex cursor-pointer items-center justify-center gap-sp-1 rounded-full border font-semibold transition-colors focus-visible:border-2 focus-visible:outline-none disabled:pointer-events-none ${buttonPriority[priority]} ${buttonSize[size]}`;
}

/** The DS outlined `Input`. Add `h-11` for single-line inputs; textareas size by rows. */
export const field =
  "block w-full appearance-none rounded-large border border-border-dark bg-surface-default px-sp-2 py-sp-1.5 text-scale-4 text-text-dark placeholder:text-text-light hover:border-border-darker hover:shadow-hover-small focus:border-border-focus focus:shadow-hover-small focus:outline-none focus:ring-2 focus:ring-inset focus:ring-border-focus aria-invalid:border-error aria-invalid:bg-surface-error aria-invalid:text-text-error disabled:cursor-not-allowed disabled:bg-surface-disabled";

/** A white card on the page's deep-navy-10 background, like `CollapsibleCard`. */
export const card = "rounded-large border border-card-border bg-card-fill";

/** An inline text link. */
export const link = "text-text-highlight underline-offset-4 hover:underline";
