import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { card, link } from "@/components/ui/styles";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

import { deleteComment, deleteIdea } from "../actions";
import { CommentForm } from "../comment-form";
import { ConfirmButton } from "../confirm-button";
import { Byline, Notice, PageShell } from "../ui";
import { getVisitor } from "../visitor";
import { VoteButton } from "../vote-button";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function IdeaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!isSupabaseConfigured()) redirect("/ideas");
  if (!UUID.test(id)) notFound();

  const visitor = await getVisitor();
  const viewer = visitor.token ?? undefined;
  const supabase = await createClient();

  const [{ data: idea }, { data: comments, error: commentsError }] = await Promise.all([
    supabase.rpc("list_ideas", { p_viewer: viewer }).eq("id", id).maybeSingle(),
    supabase.rpc("list_comments", { p_idea_id: id, p_viewer: viewer }),
  ]);

  if (!idea) notFound();

  return (
    <PageShell>
      <Link href="/ideas" className={`${link} text-scale-3`}>
        ← All ideas
      </Link>

      <article className="flex items-start gap-sp-2">
        <VoteButton ideaId={id} count={idea.vote_count} voted={idea.voted_by_me} />
        <div className="min-w-0 flex-1 space-y-sp-1.5">
          <h2 className="text-scale-6 font-semibold">{idea.title}</h2>
          <Byline name={idea.author_name} createdAt={idea.created_at}>
            {idea.is_mine && (
              <form action={deleteIdea} className="contents">
                <input type="hidden" name="id" value={id} />
                <span aria-hidden>·</span>
                <ConfirmButton message="Delete this idea along with its votes and comments?">
                  Delete
                </ConfirmButton>
              </form>
            )}
          </Byline>
          {idea.description && (
            <p className="whitespace-pre-wrap text-scale-4 text-text-medium">{idea.description}</p>
          )}
        </div>
      </article>

      <section className="space-y-sp-2">
        <h3 className="text-scale-3 font-semibold">
          {comments?.length ?? 0} {comments?.length === 1 ? "comment" : "comments"}
        </h3>

        {commentsError && <Notice>Couldn&apos;t load comments: {commentsError.message}</Notice>}

        {!!comments?.length && (
          <ul className={`${card} px-sp-2.5`}>
            {comments.map((comment) => (
              <li
                key={comment.id}
                className="space-y-sp-1 border-b border-border-medium py-sp-2 last:border-0"
              >
                <Byline name={comment.author_name} createdAt={comment.created_at}>
                  {comment.is_mine && (
                    <form action={deleteComment} className="contents">
                      <input type="hidden" name="id" value={comment.id} />
                      <span aria-hidden>·</span>
                      <ConfirmButton message="Delete this comment?">Delete</ConfirmButton>
                    </form>
                  )}
                </Byline>
                <p className="whitespace-pre-wrap text-scale-3">{comment.body}</p>
              </li>
            ))}
          </ul>
        )}

        <CommentForm ideaId={id} defaultName={visitor.name} />
      </section>
    </PageShell>
  );
}
