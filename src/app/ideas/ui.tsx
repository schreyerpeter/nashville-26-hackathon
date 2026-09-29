import Link from "next/link";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 px-4 py-16">
      <header className="space-y-3">
        <Link
          href="/"
          className="text-xs font-medium uppercase tracking-[0.2em] text-black/50 hover:text-black/80 dark:text-white/50 dark:hover:text-white/80"
        >
          Nashville 2026
        </Link>
        <h1 className="text-4xl font-semibold tracking-tight">
          <Link href="/ideas">Idea board</Link>
        </h1>
        <p className="text-black/60 dark:text-white/60">
          Pitch ideas, vote for the ones you&apos;d build, and talk them through.
        </p>
      </header>
      {children}
    </main>
  );
}

export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-black/10 px-5 py-4 text-sm text-black/60 dark:border-white/15 dark:text-white/60">
      {children}
    </p>
  );
}

export function Avatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="flex size-5 items-center justify-center rounded-full bg-black/10 text-[10px] font-medium dark:bg-white/15"
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
];

export function timeAgo(iso: string) {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

export function Byline({
  name,
  createdAt,
  children,
}: {
  name: string;
  createdAt: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-black/50 dark:text-white/50">
      <Avatar name={name} />
      <span className="font-medium text-black/70 dark:text-white/70">{name}</span>
      <span aria-hidden>·</span>
      <time dateTime={createdAt} title={new Date(createdAt).toLocaleString("en-US")}>
        {timeAgo(createdAt)}
      </time>
      {children}
    </div>
  );
}
