import Link from "next/link";

import { Logo } from "./logo";

// patient-web's MainNav top bar (features/MainNav/MainNav.tsx), as it shows above phone
// width: a white bar with the full logo on the left and one action on the right.
export function TopNav({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-sticky flex items-center justify-between gap-sp-2 bg-surface-default px-sp-2 py-sp-1.5 shadow-hover-large">
      <Link href="/" aria-label="QuickMD Together home" className="flex items-center gap-sp-1.5">
        <Logo size="s" />
        <span className="hidden border-l border-border-dark pl-sp-1.5 text-scale-4 font-semibold text-text-medium md:block">
          Together
        </span>
      </Link>
      {children}
    </header>
  );
}

// StandardPageContentPadding: the page padding and max width every patient-web screen uses.
export function PageContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <main className="flex w-full justify-center p-sp-2 md:p-sp-4 lg:p-sp-6">
      <div className={`w-full ${className}`}>{children}</div>
    </main>
  );
}
