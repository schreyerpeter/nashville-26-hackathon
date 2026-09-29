-- Idea board: team members submit ideas, comment on them, and vote.
-- Every table is readable and writable only by signed-in @quick.md accounts.

-- Team membership ------------------------------------------------------------

-- Google sign-in is restricted to the quick.md Workspace in the app, but the
-- database enforces it too so a stray non-team session can never read or write.
create function public.is_team_member()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(lower(auth.jwt() ->> 'email'), '') like '%@quick.md';
$$;

-- Profiles -------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Team members can read profiles"
  on public.profiles for select
  to authenticated
  using (public.is_team_member());

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Google puts the display name and avatar in the user metadata on sign-up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Ideas ----------------------------------------------------------------------

create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  description text not null default '' check (char_length(description) <= 4000),
  created_at timestamptz not null default now()
);

create index ideas_created_at_idx on public.ideas (created_at desc);
create index ideas_author_id_idx on public.ideas (author_id);

alter table public.ideas enable row level security;

create policy "Team members can read ideas"
  on public.ideas for select
  to authenticated
  using (public.is_team_member());

create policy "Team members can submit ideas"
  on public.ideas for insert
  to authenticated
  with check (public.is_team_member() and author_id = (select auth.uid()));

create policy "Authors can update their ideas"
  on public.ideas for update
  to authenticated
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));

create policy "Authors can delete their ideas"
  on public.ideas for delete
  to authenticated
  using (author_id = (select auth.uid()));

-- Comments -------------------------------------------------------------------

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas (id) on delete cascade,
  author_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index comments_idea_id_created_at_idx on public.comments (idea_id, created_at);
create index comments_author_id_idx on public.comments (author_id);

alter table public.comments enable row level security;

create policy "Team members can read comments"
  on public.comments for select
  to authenticated
  using (public.is_team_member());

create policy "Team members can comment"
  on public.comments for insert
  to authenticated
  with check (public.is_team_member() and author_id = (select auth.uid()));

create policy "Authors can delete their comments"
  on public.comments for delete
  to authenticated
  using (author_id = (select auth.uid()));

-- Votes ----------------------------------------------------------------------

-- The composite key is what limits each person to one vote per idea.
create table public.votes (
  idea_id uuid not null references public.ideas (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (idea_id, user_id)
);

create index votes_user_id_idx on public.votes (user_id);

alter table public.votes enable row level security;

create policy "Team members can read votes"
  on public.votes for select
  to authenticated
  using (public.is_team_member());

create policy "Team members can vote"
  on public.votes for insert
  to authenticated
  with check (public.is_team_member() and user_id = (select auth.uid()));

create policy "Users can remove their own votes"
  on public.votes for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- Feed -----------------------------------------------------------------------

-- security_invoker makes the view run with the caller's permissions, so the
-- RLS policies above still apply instead of the view owner's.
create view public.ideas_feed
with (security_invoker = on)
as
select
  i.id,
  i.title,
  i.description,
  i.created_at,
  i.author_id,
  p.full_name as author_name,
  p.avatar_url as author_avatar_url,
  (select count(*) from public.votes v where v.idea_id = i.id)::int as vote_count,
  (select count(*) from public.comments c where c.idea_id = i.id)::int as comment_count,
  exists (
    select 1 from public.votes v
    where v.idea_id = i.id and v.user_id = (select auth.uid())
  ) as voted_by_me
from public.ideas i
join public.profiles p on p.id = i.author_id;

revoke all on public.ideas_feed from anon;
