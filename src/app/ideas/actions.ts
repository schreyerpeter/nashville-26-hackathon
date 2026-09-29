"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { COMMENT_MAX, DEFAULT_NAME, DESCRIPTION_MAX, NAME_MAX, TITLE_MAX } from "./limits";
import { ensureVisitorToken, rememberName } from "./visitor";

export type FormState = { error: string | null; values?: Record<string, string> };

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

/** Validates the optional name field and remembers it for next time. */
async function authorName(formData: FormData): Promise<{ name: string } | { error: string }> {
  const name = text(formData, "name");
  if (name.length > NAME_MAX) return { error: `Keep your name under ${NAME_MAX} characters.` };
  if (name) await rememberName(name);
  return { name: name || DEFAULT_NAME };
}

export async function createIdea(_prev: FormState, formData: FormData): Promise<FormState> {
  const title = text(formData, "title");
  const description = text(formData, "description");
  const values = { title, description, name: text(formData, "name") };

  if (!title) return { error: "Give your idea a title.", values };
  if (title.length > TITLE_MAX) return { error: `Keep the title under ${TITLE_MAX} characters.`, values };
  if (description.length > DESCRIPTION_MAX) {
    return { error: `Keep the description under ${DESCRIPTION_MAX} characters.`, values };
  }

  const author = await authorName(formData);
  if ("error" in author) return { error: author.error, values };

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_idea", {
    p_title: title,
    p_description: description,
    p_author_name: author.name,
    p_author_token: await ensureVisitorToken(),
  });
  if (error) return { error: "Couldn't save your idea. Try again.", values };

  refresh();
  return { error: null };
}

export async function setVote(ideaId: string, vote: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_vote", {
    p_idea_id: ideaId,
    p_voter_token: await ensureVisitorToken(),
    p_vote: vote,
  });
  if (!error) refresh();
}

export async function addComment(_prev: FormState, formData: FormData): Promise<FormState> {
  const ideaId = text(formData, "idea_id");
  const body = text(formData, "body");
  const values = { body, name: text(formData, "name") };

  if (!body) return { error: "Write something first.", values };
  if (body.length > COMMENT_MAX) return { error: `Keep comments under ${COMMENT_MAX} characters.`, values };

  const author = await authorName(formData);
  if ("error" in author) return { error: author.error, values };

  const supabase = await createClient();
  const { error } = await supabase.rpc("add_comment", {
    p_idea_id: ideaId,
    p_body: body,
    p_author_name: author.name,
    p_author_token: await ensureVisitorToken(),
  });
  if (error) return { error: "Couldn't post your comment. Try again.", values };

  refresh();
  return { error: null };
}

// The database only deletes rows whose author token matches, so these can't
// remove anyone else's posts.
export async function deleteComment(formData: FormData) {
  const supabase = await createClient();
  await supabase.rpc("delete_comment", {
    p_id: text(formData, "id"),
    p_author_token: await ensureVisitorToken(),
  });
  refresh();
}

export async function deleteIdea(formData: FormData) {
  const supabase = await createClient();
  const { data: deleted } = await supabase.rpc("delete_idea", {
    p_id: text(formData, "id"),
    p_author_token: await ensureVisitorToken(),
  });
  if (deleted) redirect("/ideas");
}
