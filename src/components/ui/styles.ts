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

// Loading is not disabled: the DS keeps the idle palette and pulses the fill, so a busy
// button reads as busy rather than dead. Pair it with `aria-busy` and `disabled`.
const buttonLoading: Record<Priority, string> = {
  primary:
    "pointer-events-none animate-button-primary-loading-pulse disabled:border-coastal-blue-60 disabled:bg-coastal-blue-60 disabled:text-white",
  secondary:
    "pointer-events-none animate-button-secondary-loading-pulse disabled:border-coastal-blue-40 disabled:bg-coastal-blue-10 disabled:text-coastal-blue-50",
  tertiary: "pointer-events-none disabled:text-deep-navy-80",
};

const buttonSize: Record<Size, string> = {
  s: "h-8 px-sp-2 py-sp-0.75 text-scale-3",
  m: "h-11 px-sp-2 py-sp-1.5 text-scale-4",
};

/** The DS `Button`: a pill with primary, secondary, and tertiary priorities. */
export function button(priority: Priority = "primary", size: Size = "m", { loading = false } = {}) {
  return `relative isolate inline-flex cursor-pointer items-center justify-center gap-sp-1 rounded-full border font-semibold transition-colors focus-visible:border-2 focus-visible:outline-none disabled:pointer-events-none ${buttonPriority[priority]} ${buttonSize[size]} ${loading ? buttonLoading[priority] : ""}`;
}

/** Typography/Heading.tsx: `Heading level="h1" | "h2" | "h3"` (scale 7, 6, 5). */
export const heading = {
  h1: "text-scale-7 font-semibold text-text-dark",
  h2: "text-scale-6 font-semibold text-text-dark",
  h3: "text-scale-5 font-semibold text-text-dark",
};

/** Typography/Paragraph.tsx: body copy is text-medium, not text-dark. */
export const paragraph = {
  md: "text-scale-4 text-text-medium",
  sm: "text-scale-3 text-text-medium",
  xs: "text-scale-2 text-text-medium",
};

/** Typography/Label.tsx and Fieldset/FormLabel.tsx: semibold, `lg` (scale 4) by default. */
export const label = {
  lg: "text-scale-4 font-semibold text-text-dark",
  md: "text-scale-3 font-semibold text-text-dark",
  sm: "text-scale-2 font-semibold text-text-dark",
};

/**
 * Fieldset/Field.tsx: stacks a label, an optional error, and a control 8px apart, and
 * turns the label red when the field is invalid. Put `aria-invalid` on the control.
 */
export const formField =
  "grid gap-sp-1 has-aria-invalid:[&>[data-slot=label]]:text-text-error";

/** Fieldset/ErrorMessage.tsx. */
export const errorMessage = "text-scale-3 text-text-error";

/**
 * The DS outlined `Input`: 44px tall, rounded-large, darker border and a small shadow on
 * hover, an inset focus ring, and a red fill when `aria-invalid` is set.
 */
export const field =
  "block h-11 w-full appearance-none rounded-large border border-border-dark bg-surface-default px-sp-2 py-sp-1.5 text-scale-4 text-text-dark placeholder:text-text-light hover:border-border-darker hover:shadow-hover-small focus:border-border-focus focus:shadow-hover-small focus:outline-none focus:ring-2 focus:ring-inset focus:ring-border-focus aria-invalid:border-error aria-invalid:bg-surface-error aria-invalid:text-text-error disabled:cursor-not-allowed disabled:bg-surface-disabled";

/** A white card on the page's background, like the patient-web dashboard cards. */
export const card = "rounded-large border border-border-medium bg-surface-default";

/** A card that is also a link or button (Dashboard `InstallMobileAppCard`). */
export const cardInteractive = `${card} cursor-pointer transition-colors hover:border-coastal-blue-40 hover:bg-coastal-blue-10 focus-visible:outline-2 focus-visible:outline-border-focus`;

type BannerVariant = "informative" | "error" | "success" | "warning";

const bannerVariant: Record<BannerVariant, { box: string; text: string }> = {
  informative: { box: "border-coastal-blue-40 bg-coastal-blue-10", text: "text-text-highlight" },
  error: { box: "border-red-50 bg-surface-error", text: "text-text-error" },
  success: { box: "border-seafoam-50 bg-surface-success", text: "text-text-success" },
  warning: { box: "border-amber-50 bg-surface-warning", text: "text-text-warning" },
};

/**
 * The DS `Banner`: a tinted, outlined box. `box` goes on the container; `title` and
 * `text` color the semibold title and the description inside it.
 */
export function banner(variant: BannerVariant = "informative") {
  const { box, text } = bannerVariant[variant];
  return {
    box: `grid gap-sp-0.5 rounded-large border p-sp-2 ${box}`,
    title: `text-scale-4 font-semibold ${text}`,
    text: `text-scale-3 ${text}`,
  };
}

/**
 * The DS `Link`: semibold, in the surrounding text color, with a 1px shade-20 underline
 * sitting 2px below the text. Add `text-scale-4` (size "lg") or `text-scale-2` ("sm")
 * when it isn't inline in body copy.
 */
export const link =
  "relative inline-block cursor-pointer font-semibold text-text-dark after:absolute after:-bottom-sp-0.25 after:left-0 after:h-sp-0.125 after:w-full after:bg-shade-20";

/** navigation/Tabset.tsx: put `tablist` on a row, and `tab(isActive)` on each tab. */
export const tablist = "flex gap-sp-1 border-b border-border-dark";

export function tab(active: boolean) {
  return `-mb-px cursor-pointer whitespace-nowrap px-sp-1 py-sp-0.75 text-scale-4 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus ${
    active ? "border-b-2 border-border-highlight text-text-highlight" : "text-text-dark"
  }`;
}
