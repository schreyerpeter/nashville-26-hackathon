-- Open the idea board to everyone: no sign-in and no team check.
--
-- Visitors are identified by a random token kept in an httpOnly cookie. It
-- decides whether they've voted and which ideas and comments they can delete.
-- Tokens must stay secret, so the tables allow no direct access at all. Every
-- read and write goes through the security definer functions below, and none
-- of them return a token.

drop view if exists public.ideas_feed;
drop table if exists public.votes, public.comments, public.ideas, public.profiles;
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.is_team_member();

-- Tables ---------------------------------------------------------------------

create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  description text not null default '' check (char_length(description) <= 4000),
  author_name text not null check (char_length(btrim(author_name)) between 1 and 60),
  author_token uuid not null,
  created_at timestamptz not null default now()
);

create index ideas_created_at_idx on public.ideas (created_at desc);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  author_name text not null check (char_length(btrim(author_name)) between 1 and 60),
  author_token uuid not null,
  created_at timestamptz not null default now()
);

create index comments_idea_id_created_at_idx on public.comments (idea_id, created_at);

-- The composite key limits each visitor to one vote per idea.
create table public.votes (
  idea_id uuid not null references public.ideas (id) on delete cascade,
  voter_token uuid not null,
  created_at timestamptz not null default now(),
  primary key (idea_id, voter_token)
);

-- RLS with no policies, plus revoked grants, leaves the functions as the only way in.
alter table public.ideas enable row level security;
alter table public.comments enable row level security;
alter table public.votes enable row level security;

revoke all on public.ideas, public.comments, public.votes from anon, authenticated;

-- Reads ----------------------------------------------------------------------

create function public.list_ideas(p_viewer uuid default null)
returns table (
  id uuid,
  title text,
  description text,
  author_name text,
  created_at timestamptz,
  vote_count int,
  comment_count int,
  voted_by_me boolean,
  is_mine boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    i.id,
    i.title,
    i.description,
    i.author_name,
    i.created_at,
    (select count(*) from public.votes v where v.idea_id = i.id)::int,
    (select count(*) from public.comments c where c.idea_id = i.id)::int,
    exists (
      select 1 from public.votes v
      where v.idea_id = i.id and v.voter_token = p_viewer
    ),
    coalesce(i.author_token = p_viewer, false)
  from public.ideas i;
$$;

create function public.list_comments(p_idea_id uuid, p_viewer uuid default null)
returns table (
  id uuid,
  body text,
  author_name text,
  created_at timestamptz,
  is_mine boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select c.id, c.body, c.author_name, c.created_at, coalesce(c.author_token = p_viewer, false)
  from public.comments c
  where c.idea_id = p_idea_id
  order by c.created_at;
$$;

-- Writes ---------------------------------------------------------------------

create function public.create_idea(
  p_title text,
  p_description text,
  p_author_name text,
  p_author_token uuid
)
returns uuid
language sql
security definer
set search_path = ''
as $$
  insert into public.ideas (title, description, author_name, author_token)
  values (btrim(p_title), coalesce(btrim(p_description), ''), btrim(p_author_name), p_author_token)
  returning id;
$$;

create function public.add_comment(
  p_idea_id uuid,
  p_body text,
  p_author_name text,
  p_author_token uuid
)
returns uuid
language sql
security definer
set search_path = ''
as $$
  insert into public.comments (idea_id, body, author_name, author_token)
  values (p_idea_id, btrim(p_body), btrim(p_author_name), p_author_token)
  returning id;
$$;

-- Sets the vote to p_vote rather than toggling, so retries are harmless.
create function public.set_vote(p_idea_id uuid, p_voter_token uuid, p_vote boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_vote then
    insert into public.votes (idea_id, voter_token)
    values (p_idea_id, p_voter_token)
    on conflict do nothing;
  else
    delete from public.votes
    where idea_id = p_idea_id and voter_token = p_voter_token;
  end if;
end;
$$;

create function public.delete_idea(p_id uuid, p_author_token uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  with deleted as (
    delete from public.ideas
    where id = p_id and author_token = p_author_token
    returning 1
  )
  select exists (select 1 from deleted);
$$;

create function public.delete_comment(p_id uuid, p_author_token uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  with deleted as (
    delete from public.comments
    where id = p_id and author_token = p_author_token
    returning 1
  )
  select exists (select 1 from deleted);
$$;

grant execute on function
  public.list_ideas(uuid),
  public.list_comments(uuid, uuid),
  public.create_idea(text, text, text, uuid),
  public.add_comment(uuid, text, text, uuid),
  public.set_vote(uuid, uuid, boolean),
  public.delete_idea(uuid, uuid),
  public.delete_comment(uuid, uuid)
to anon, authenticated;
