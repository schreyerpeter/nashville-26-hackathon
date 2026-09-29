import type { Metadata } from "next";
import Link from "next/link";

import { card, link } from "@/components/ui/styles";
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
      className={`rounded-full px-sp-1.5 py-sp-0.5 ${
        active
          ? "bg-coastal-blue-10 font-semibold text-coastal-blue-50"
          : "text-text-light hover:text-text-highlight"
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

      <section className="space-y-sp-1.5">
        <div className="flex items-center justify-between">
          <h2 className="text-scale-3 font-semibold">
            {ideas?.length ?? 0} {ideas?.length === 1 ? "idea" : "ideas"}
          </h2>
          <nav className="flex gap-sp-0.5 text-scale-3" aria-label="Sort ideas">
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
          <ul className={`${card} px-sp-2.5`}>
            {ideas.map((idea) => (
              <li
                key={idea.id}
                className="flex items-start gap-sp-2 border-b border-border-medium py-sp-2 last:border-0"
              >
                <VoteButton ideaId={idea.id} count={idea.vote_count} voted={idea.voted_by_me} />
                <div className="min-w-0 flex-1 space-y-sp-0.75">
                  <Link href={`/ideas/${idea.id}`} className="block text-scale-4 font-semibold hover:text-text-highlight">
                    {idea.title}
                  </Link>
                  {idea.description && (
                    <p className="line-clamp-2 text-scale-3 text-text-medium">
                      {idea.description}
                    </p>
                  )}
                  <Byline name={idea.author_name} createdAt={idea.created_at}>
                    <span aria-hidden>·</span>
                    <Link href={`/ideas/${idea.id}`} className={link}>
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
