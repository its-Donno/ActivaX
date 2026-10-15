-- Activa database schema
-- Run in the Supabase SQL editor, or via the Supabase CLI:
--   supabase db push
--
-- The application ships with a local, file-backed data store for zero-config
-- development. When Supabase environment variables are configured, this schema
-- is the production data model and enforces Row Level Security (RLS).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type action_type as enum ('ask', 'try', 'join', 'help', 'share', 'project');
exception when duplicate_object then null; end $$;

do $$ begin
  create type category as enum ('environment', 'education', 'technology', 'community', 'health', 'arts');
exception when duplicate_object then null; end $$;

do $$ begin
  create type participation_role as enum ('participant', 'helper', 'interested');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_type as enum ('follow', 'like', 'comment', 'join', 'help', 'mention', 'project_update');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  username        text not null unique,
  display_name    text not null,
  avatar_url      text,
  bio             text not null default '',
  location        text,
  interests       text[] not null default '{}',
  skills_offered  text[] not null default '{}',
  skills_wanted   text[] not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists profiles_username_idx on public.profiles (lower(username));

-- ---------------------------------------------------------------------------
-- Actions (the core content type: posts and activities)
-- ---------------------------------------------------------------------------
create table if not exists public.actions (
  id                uuid primary key default gen_random_uuid(),
  author_id         uuid not null references public.profiles (id) on delete cascade,
  type              action_type not null,
  title             text not null,
  description       text not null,
  media_url         text,
  category          category not null,
  tags              text[] not null default '{}',
  location          text,
  event_date        timestamptz,
  skills_needed     text[] not null default '{}',
  participant_limit integer check (participant_limit is null or participant_limit > 0),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists actions_created_at_idx on public.actions (created_at desc);
create index if not exists actions_category_idx on public.actions (category);
create index if not exists actions_author_idx on public.actions (author_id);

create table if not exists public.action_participants (
  id         uuid primary key default gen_random_uuid(),
  action_id  uuid not null references public.actions (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  role       participation_role not null default 'participant',
  created_at timestamptz not null default now(),
  unique (action_id, user_id)
);
create index if not exists action_participants_action_idx on public.action_participants (action_id);
create index if not exists action_participants_user_idx on public.action_participants (user_id);

create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  action_id  uuid not null references public.actions (id) on delete cascade,
  author_id  uuid not null references public.profiles (id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);
create index if not exists comments_action_idx on public.comments (action_id);

create table if not exists public.likes (
  id         uuid primary key default gen_random_uuid(),
  action_id  uuid not null references public.actions (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (action_id, user_id)
);

create table if not exists public.saved_items (
  id         uuid primary key default gen_random_uuid(),
  action_id  uuid not null references public.actions (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (action_id, user_id)
);

create table if not exists public.follows (
  follower_id  uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  actor_id   uuid references public.profiles (id) on delete set null,
  type       notification_type not null,
  action_id  uuid references public.actions (id) on delete cascade,
  message    text not null,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Messaging
-- ---------------------------------------------------------------------------
create table if not exists public.conversations (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id         uuid not null references public.profiles (id) on delete cascade,
  last_read_at    timestamptz,
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id       uuid not null references public.profiles (id) on delete cascade,
  body            text not null,
  created_at      timestamptz not null default now()
);
create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);

-- ---------------------------------------------------------------------------
-- Projects (optional, for larger multi-session collaborations)
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.profiles (id) on delete cascade,
  title       text not null,
  description text not null default '',
  created_at  timestamptz not null default now()
);

create table if not exists public.project_members (
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  role       text not null default 'member',
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists actions_touch on public.actions;
create trigger actions_touch before update on public.actions
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-create a profile when a user signs up
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'username', ''),
      'user_' || substr(replace(new.id::text, '-', ''), 1, 10)
    ),
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'New member'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.actions             enable row level security;
alter table public.action_participants enable row level security;
alter table public.comments            enable row level security;
alter table public.likes               enable row level security;
alter table public.saved_items         enable row level security;
alter table public.follows             enable row level security;
alter table public.notifications       enable row level security;
alter table public.conversations       enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages            enable row level security;
alter table public.projects            enable row level security;
alter table public.project_members     enable row level security;

-- Helper: is the current user a member of a conversation?
create or replace function public.is_conversation_member(conv uuid)
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.conversation_members
    where conversation_id = conv and user_id = auth.uid()
  );
$$;

-- profiles: public read, self write
create policy "profiles_select" on public.profiles
  for select using (true);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_insert_self" on public.profiles
  for insert with check (auth.uid() = id);

-- actions: public read, author write
create policy "actions_select" on public.actions for select using (true);
create policy "actions_insert_own" on public.actions
  for insert with check (auth.uid() = author_id);
create policy "actions_update_own" on public.actions
  for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "actions_delete_own" on public.actions
  for delete using (auth.uid() = author_id);

-- participants: public read, self join/leave, author can remove
create policy "participants_select" on public.action_participants for select using (true);
create policy "participants_insert_self" on public.action_participants
  for insert with check (auth.uid() = user_id);
create policy "participants_delete_self_or_owner" on public.action_participants
  for delete using (
    auth.uid() = user_id
    or auth.uid() = (select author_id from public.actions where id = action_id)
  );

-- comments: public read, author write
create policy "comments_select" on public.comments for select using (true);
create policy "comments_insert_own" on public.comments
  for insert with check (auth.uid() = author_id);
create policy "comments_update_own" on public.comments
  for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "comments_delete_own" on public.comments
  for delete using (auth.uid() = author_id);

-- likes: public read, self write
create policy "likes_select" on public.likes for select using (true);
create policy "likes_insert_self" on public.likes
  for insert with check (auth.uid() = user_id);
create policy "likes_delete_self" on public.likes
  for delete using (auth.uid() = user_id);

-- saved items: private to owner
create policy "saved_select_own" on public.saved_items
  for select using (auth.uid() = user_id);
create policy "saved_insert_self" on public.saved_items
  for insert with check (auth.uid() = user_id);
create policy "saved_delete_self" on public.saved_items
  for delete using (auth.uid() = user_id);

-- follows: public read, self write
create policy "follows_select" on public.follows for select using (true);
create policy "follows_insert_self" on public.follows
  for insert with check (auth.uid() = follower_id);
create policy "follows_delete_self" on public.follows
  for delete using (auth.uid() = follower_id);

-- notifications: owner reads/updates, actor may insert
create policy "notifications_select_own" on public.notifications
  for select using (auth.uid() = user_id);
create policy "notifications_update_own" on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notifications_insert_actor" on public.notifications
  for insert with check (auth.uid() = actor_id);
create policy "notifications_delete_own" on public.notifications
  for delete using (auth.uid() = user_id);

-- conversations: only members can read/update
create policy "conversations_select_member" on public.conversations
  for select using (public.is_conversation_member(id));
create policy "conversations_insert_authenticated" on public.conversations
  for insert with check (auth.uid() is not null);
create policy "conversations_update_member" on public.conversations
  for update using (public.is_conversation_member(id));

-- conversation members
create policy "members_select_member" on public.conversation_members
  for select using (public.is_conversation_member(conversation_id));
create policy "members_insert_self" on public.conversation_members
  for insert with check (auth.uid() = user_id or public.is_conversation_member(conversation_id));
create policy "members_update_self" on public.conversation_members
  for update using (auth.uid() = user_id);

-- messages: only conversation members
create policy "messages_select_member" on public.messages
  for select using (public.is_conversation_member(conversation_id));
create policy "messages_insert_self_member" on public.messages
  for insert with check (
    auth.uid() = sender_id and public.is_conversation_member(conversation_id)
  );
create policy "messages_delete_own" on public.messages
  for delete using (auth.uid() = sender_id);

-- projects
create policy "projects_select" on public.projects for select using (true);
create policy "projects_insert_own" on public.projects
  for insert with check (auth.uid() = owner_id);
create policy "projects_update_own" on public.projects
  for update using (auth.uid() = owner_id);
create policy "projects_delete_own" on public.projects
  for delete using (auth.uid() = owner_id);

create policy "project_members_select" on public.project_members for select using (true);
create policy "project_members_insert_self" on public.project_members
  for insert with check (auth.uid() = user_id);
create policy "project_members_delete_self" on public.project_members
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Storage buckets and policies
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "avatars_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "avatars_owner_update" on storage.objects
  for update using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "avatars_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "media_public_read" on storage.objects
  for select using (bucket_id = 'media');
create policy "media_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "media_owner_update" on storage.objects
  for update using (
    bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "media_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]
  );
