<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# QuickMD design system (required for all UI)

Every page and component in this app must use QuickMD's design system. Before building or changing any UI, read [DESIGN.md](DESIGN.md). Summary:

- Style only with the QuickMD tokens in `src/app/globals.css`: `bg-coastal-blue-50`, `text-text-medium`, `border-border-medium`, `text-scale-4`, `rounded-large`, `p-sp-2`, and so on. They are ported from `~/quickmd/design-system/src/theme/`. Tailwind's default colors are turned off.
- Reuse `button()`, `field`, `card`, `link` and `LogoMark` from `src/components/ui/` before writing new classes.
- No raw hex, no arbitrary values like `text-[16px]`, no `dark:` variants.
- If you need a missing token or component, port it from the design-system repo rather than approximating it.

# Keep the bar high

Using the tokens is the minimum. This community should look polished and feel warm, on the
landing page, sign-in, and every page of the forum (`discourse-theme/`). Before you say UI
work is done, run it, screenshot it at 1440 and 390 wide, and read the screenshots. Give
pages a clear hierarchy, depth (soft gradients, shadows, rounded cards), real content, and
responsive layouts; don't ship a flat, unstyled, or half-finished screen, and don't remove the
988 / peer-support safety copy. The full checklist is "The quality bar" in
[DESIGN.md](DESIGN.md). For the forum, edit `discourse-theme/common/common.scss`, run
`scripts/discourse-local.sh theme`, and keep `scripts/discourse-seed.rb` rich enough that the
forum never looks empty.
