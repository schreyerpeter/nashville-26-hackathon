# Design system

Every screen in this app uses QuickMD's design system, so it looks like the rest of
QuickMD's products. Read this before building or changing any UI.

## Where it comes from

The source of truth is the QuickMD design-system repo (`~/quickmd/design-system`,
published as `@quickmd-llc/design-system`). This app does **not** install that package:
the package expects React 18 (this app runs 19), ships a Tailwind v3 preset (this app
uses Tailwind v4, which is configured in CSS), and comes from a private registry that
Vercel can't read without a token. Its tokens are copied into `src/app/globals.css`
instead, under the same names QuickMD's apps use.

| Design-system file | Becomes |
| --- | --- |
| `src/theme/colors.ts` | `--color-*` → `bg-coastal-blue-50`, `text-text-dark`, `border-border-medium`, … |
| `src/theme/font-size.ts` | `--text-size-*` → `text-size-4` |
| `src/components/data-display/Typography/utils.ts` | `--text-scale-*` → `text-scale-4` (size, line height and tracking together) |
| `src/theme/lineHeight.ts`, `letterSpacing.ts` | `leading-lineheight-3`, `tracking-letter-spacing-3` |
| `src/theme/borderRadius.ts` | `rounded-small` / `medium` / `large` / `larger` (2 / 4 / 8 / 16px) |
| `src/theme/zIndex.ts`, `animations.ts` | `z-sticky`, `z-fixed`, …; `animate-fade-in`, button loading pulses |
| `src/theme/boxShadow.ts` | `shadow-hover-small`, `shadow-hover-large`, `shadow-float-small` |
| `src/theme/spacing.ts` | `p-sp-2`, `gap-sp-1.5`, `space-y-sp-3`, … (sp-1 = 8px) |
| `src/theme/screens.ts` | breakpoints `sm` 320px, `md` 576px, `lg` 1024px |
| `src/config/tailwind.config.ts` | fonts: Outfit (`font-sans`, the default), Poppins (`font-poppins`); `touch:` / `not-touch:` variants |

## Vocabulary

- **Page:** `bg-background` (deep-navy-10), set on `<body>`. Content sits in white cards on it.
- **Text:** `text-text-dark` is the default. Use `text-text-medium` for secondary copy,
  `text-text-light` for meta and captions, `text-text-highlight` for links and accents,
  and `text-text-error` / `text-text-success` / `text-text-warning` for status.
- **Surfaces:** `bg-surface-default` (white), `bg-surface-highlight` / `bg-surface-active`
  (coastal-blue-10), `bg-surface-error` / `success` / `warning`, and `bg-surface-disabled`.
- **Borders:** `border-border-medium` for dividers and cards, `border-border-dark` for
  inputs, `border-border-darker` for input hover, `border-border-focus` for focus, and
  `border-border-error`.
- **Brand:** `coastal-blue-50` is the primary action color: 60 on hover, 80 when active,
  10 and 20 as tints. The other palettes are `deep-navy`, `emerald`, `seafoam`, `amber`,
  `frost`, `sand`, `neutral`, `red`, and `shade` (translucent neutral-95), each on steps
  5, 10, 20, … 90, 95. `marketing-*` holds the marketing brand colors.
- **Type:** use `text-scale-N`. Body text is `text-scale-4` (16/20), small text is
  `text-scale-3` (14/20), meta is `text-scale-2` (12/18), a section title is
  `text-scale-6` (24/32), and a page title is `text-scale-8` (40/56). Only two weights:
  `font-normal` and `font-semibold`.

## Shared pieces: `src/components/ui/`

Reuse these before writing classes for the same element.

- `button(priority?, size?, { loading? })` from `styles.ts`: the design-system `Button`, a
  pill with `"primary"` (default), `"secondary"`, or `"tertiary"` priority and `"m"` (44px,
  default) or `"s"` (32px) size. `loading` pulses the fill the way the DS does; pair it with
  `disabled` and `aria-busy`. Example: `<button className={button("secondary", "s")}>`.
- `heading.h1` / `h2` / `h3`: DS `Heading` (scale 7 / 6 / 5, semibold). A page title is `h1`.
- `paragraph.md` / `sm` / `xs`: DS `Paragraph`. Body copy is `text-text-medium`, not dark.
- `label.lg` / `md` / `sm`: DS `Label` and `FormLabel` (semibold).
- `formField`, `field`, `errorMessage`: DS `Field` + `Input` + `ErrorMessage`. Wrap a
  `data-slot="label"` label, an optional error, and the input in `formField`; set
  `aria-invalid` on the input and the label, input, and fill all turn red.
- `card` / `cardInteractive`: the white, `border-medium`, `rounded-large` cards from the
  patient-web dashboard; the interactive one tints coastal-blue on hover.
- `banner(variant)`: DS `Banner` (`informative`, `warning`, `error`, `success`). Returns
  `box`, `title`, and `text` classes.
- `link`: DS `Link`. Semibold, in the text color, with a 1px shade-20 underline. It is
  **not** blue.
- `tablist` / `tab(active)`: DS `Tabset`.
- `Logo` and `LogoMark` from `logo.tsx`: the full QuickMD wordmark (`size` xss to xl, as
  in the DS) and the mark alone. Screens use `Logo`, like patient-web.
- `TopNav` and `PageContent` from `top-nav.tsx`: patient-web's white top bar (logo, product
  name, one action) and its standard page padding.

Screen patterns come from patient-web: sign-in screens use its `AuthLayout` (one centered
white card, logo on top, centered `h2`); other screens use `TopNav` + `PageContent` with
sections stacked `gap-sp-3`/`gap-sp-5`, each an `h3` over its content.

If a design-system component you need isn't here yet, port its classes from
`~/quickmd/design-system/src/components/<group>/<Name>/<Name>.tsx` into
`src/components/ui/`, rather than approximating it inline.

## Rules

- **Tokens only.** No raw hex, `rgb()`, or arbitrary values (`text-[16px]`, `p-[13px]`,
  `bg-[#123456]`). The one exception is `grid-template-columns` / `grid-template-rows`,
  as in the design system.
- **Tailwind's default palette is switched off.** `--color-*: initial` removes
  `red-500`, `gray-200`, `slate-*` and the rest. If a color class does nothing, it isn't
  a QuickMD token; pick one from the list above.
- **No dark mode.** The design system is light only. Don't add `dark:` variants.
- **Missing token?** Copy it from the design-system source file into `globals.css`,
  under the same name and value. If the design system doesn't have it either, ask rather
  than invent one.
- **Mind the breakpoints.** They are QuickMD's: `sm` is 320px (almost always on), so
  use `md:` (576px) for "above phone width" and `lg:` (1024px) for desktop.

## The forum (Discourse)

`discourse-theme/` is the same design system as a Discourse theme: the palette as a color
scheme in `about.json`, and Outfit, pill buttons, 8px cards, the Tabset-style nav, and the
input states in `common/common.scss`, plus the logo SVGs. `scripts/discourse-local.sh
setup` installs it; after editing it, run `scripts/discourse-local.sh theme` to reapply.
Hex values are allowed there (Discourse has no Tailwind), but copy them from
`globals.css` rather than inventing new ones.
