import type { Metadata } from "next";
import Link from "next/link";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

import { IdeaForm } from "./idea-form";
import { Byline, Notice, PageShell } from "./ui";
import { getVisitor } from "./visitor";
import { VoteButton } from "./vote-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Idea board · Nashville 26 Hackathon" };

type Sort = "top" | "new";

function SortLink({ sort, current, children }: { sort: Sort; current: Sort; children: React.ReactNode }) {
  const active = sort === current;
  return (
    <Link
      href={`/ideas?sort=${sort}`}
      aria-current={active ? "page" : undefined}
      className={`rounded-md px-2.5 py-1 ${
        active
          ? "bg-black/5 font-medium text-foreground dark:bg-white/10"
          : "text-black/50 hover:text-foreground dark:text-white/50"
      }`}
    >
      {children}
    </Link>
  );
}

export default async function IdeasPage({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const params = await searchParams;

  if (!isSupabaseConfigured()) {
    return (
      <PageShell>
        <Notice>
          Supabase isn&apos;t configured. Set NEXT_PUBLIC_SUPABASE_URL and
          NEXT_PUBLIC_SUPABASE_ANON_KEY to use the idea board.
        </Notice>
      </PageShell>
    );
  }

  const visitor = await getVisitor();
  const sort: Sort = params.sort === "new" ? "new" : "top";
  const supabase = await createClient();
  const feed = supabase.rpc("list_ideas", { p_viewer: visitor.token ?? undefined });
  const { data: ideas, error } = await (sort === "top"
    ? feed.order("vote_count", { ascending: false }).order("created_at", { ascending: false })
    : feed.order("created_at", { ascending: false }));

  return (
    <PageShell>
      <IdeaForm defaultName={visitor.name} />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">
            {ideas?.length ?? 0} {ideas?.length === 1 ? "idea" : "ideas"}
          </h2>
          <nav className="flex gap-1 text-sm" aria-label="Sort ideas">
            <SortLink sort="top" current={sort}>
              Top
            </SortLink>
            <SortLink sort="new" current={sort}>
              New
            </SortLink>
          </nav>
        </div>

        {error ? (
          <Notice>Couldn&apos;t load ideas: {error.message}</Notice>
        ) : !ideas?.length ? (
          <Notice>No ideas yet. Be the first to submit one.</Notice>
        ) : (
          <ul className="rounded-xl border border-black/10 px-5 dark:border-white/15">
            {ideas.map((idea) => (
              <li
                key={idea.id}
                className="flex items-start gap-4 border-b border-black/10 py-4 last:border-0 dark:border-white/15"
              >
                <VoteButton ideaId={idea.id} count={idea.vote_count} voted={idea.voted_by_me} />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Link href={`/ideas/${idea.id}`} className="block font-medium hover:underline">
                    {idea.title}
                  </Link>
                  {idea.description && (
                    <p className="line-clamp-2 text-sm text-black/60 dark:text-white/60">
                      {idea.description}
                    </p>
                  )}
                  <Byline name={idea.author_name} createdAt={idea.created_at}>
                    <span aria-hidden>·</span>
                    <Link href={`/ideas/${idea.id}`} className="hover:underline">
                      {idea.comment_count} {idea.comment_count === 1 ? "comment" : "comments"}
                    </Link>
                  </Byline>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
