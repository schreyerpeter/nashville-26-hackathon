import Link from "next/link";

import { LogoMark } from "@/components/ui/logo";
import { card } from "@/components/ui/styles";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-sp-4 px-sp-2 py-sp-8">
      <header className="space-y-sp-1.5">
        <Link
          href="/"
          className="flex items-center gap-sp-1 text-scale-2 font-semibold uppercase text-text-light hover:text-text-highlight"
        >
          <LogoMark className="h-5 w-auto" aria-hidden />
          Nashville 2026
        </Link>
        <h1 className="text-scale-8 font-semibold">
          <Link href="/ideas">Idea board</Link>
        </h1>
        <p className="text-scale-4 text-text-medium">
          Pitch ideas, vote for the ones you&apos;d build, and talk them through.
        </p>
      </header>
      {children}
    </main>
  );
}

export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className={`${card} px-sp-2.5 py-sp-2 text-scale-3 text-text-medium`}>
      {children}
    </p>
  );
}

export function Avatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="flex size-5 items-center justify-center rounded-full bg-coastal-blue-20 text-scale-1 font-semibold text-coastal-blue-70"
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
    <div className="flex flex-wrap items-center gap-x-sp-1 gap-y-sp-0.5 text-scale-2 text-text-light">
      <Avatar name={name} />
      <span className="font-semibold text-text-medium">{name}</span>
      <span aria-hidden>·</span>
      <time dateTime={createdAt} title={new Date(createdAt).toLocaleString("en-US")}>
        {timeAgo(createdAt)}
      </time>
      {children}
    </div>
  );
}
