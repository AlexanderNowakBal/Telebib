-- Migration 001: Initial schema
-- Run against your Supabase project SQL editor or via `supabase db push`

-- ─── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Profiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url  text,
  locale      text not null default 'fr-BE',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Auto-create profile on user sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Workspaces ───────────────────────────────────────────────────────────────
create table if not exists public.workspaces (
  id             uuid primary key default uuid_generate_v4(),
  name           text not null,
  slug           text not null unique,
  default_locale text not null default 'fr-BE',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.workspaces enable row level security;

-- ─── Workspace Members ────────────────────────────────────────────────────────
create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  role         text not null default 'member'
    check (role in ('owner', 'admin', 'member', 'viewer')),
  joined_at    timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create index if not exists workspace_members_user_id_idx on public.workspace_members(user_id);

alter table public.workspace_members enable row level security;

-- ─── Boards ──────────────────────────────────────────────────────────────────
create table if not exists public.boards (
  id           uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name         text not null,
  description  text not null default '',
  archived     boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists boards_workspace_id_idx on public.boards(workspace_id, archived);

alter table public.boards enable row level security;

-- ─── Columns ─────────────────────────────────────────────────────────────────
create table if not exists public.columns (
  id             uuid primary key default uuid_generate_v4(),
  board_id       uuid not null references public.boards(id) on delete cascade,
  name           text not null,
  position       bigint not null check (position >= 0),
  is_done_column boolean not null default false,
  wip_limit      integer,
  version        integer not null default 1 check (version >= 1),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (board_id, position)
);

create index if not exists columns_board_id_idx on public.columns(board_id);

alter table public.columns enable row level security;

-- ─── Cards ───────────────────────────────────────────────────────────────────
create table if not exists public.cards (
  id          uuid primary key default uuid_generate_v4(),
  board_id    uuid not null references public.boards(id) on delete cascade,
  column_id   uuid not null references public.columns(id) on delete cascade,
  title       text not null,
  description text not null default '',
  assignee_id uuid references auth.users(id) on delete set null,
  priority    text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  due_date    date,
  position    bigint not null check (position >= 0),
  version     integer not null default 1 check (version >= 1),
  archived_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists cards_board_col_pos_idx on public.cards(board_id, column_id, position);
create index if not exists cards_board_updated_idx on public.cards(board_id, updated_at desc);
create index if not exists cards_assignee_idx on public.cards(assignee_id);
create index if not exists cards_active_idx on public.cards(board_id) where archived_at is null;

alter table public.cards enable row level security;

-- ─── Labels ──────────────────────────────────────────────────────────────────
create table if not exists public.labels (
  id          uuid primary key default uuid_generate_v4(),
  board_id    uuid not null references public.boards(id) on delete cascade,
  name        text not null,
  color_token text not null,
  unique (board_id, name)
);

alter table public.labels enable row level security;

-- ─── Card Labels ─────────────────────────────────────────────────────────────
create table if not exists public.card_labels (
  card_id  uuid not null references public.cards(id) on delete cascade,
  label_id uuid not null references public.labels(id) on delete cascade,
  primary key (card_id, label_id)
);

create index if not exists card_labels_label_id_idx on public.card_labels(label_id);

alter table public.card_labels enable row level security;
