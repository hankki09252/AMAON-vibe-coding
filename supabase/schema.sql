create extension if not exists pgcrypto;

create table if not exists public.media_items (
  storage_key text primary key,
  player_id text not null,
  category text not null check (category in ('pitching','batting','fielding','photo','profile')),
  content_type text not null,
  uploaded_at timestamptz not null default now(),
  uploaded_by text not null
);

create table if not exists public.media_likes (
  media_key text not null,
  visitor_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (media_key, visitor_id)
);

create table if not exists public.player_profile_overrides (
  team_id text not null,
  player_id text not null,
  roster_year integer not null default 2026,
  jersey_number text not null default '',
  grade text not null default '',
  position text not null,
  height integer not null,
  weight integer not null,
  introduction text not null default '',
  strengths text not null default '',
  aspiration text not null default '',
  updated_at timestamptz not null default now(),
  updated_by text not null,
  primary key (team_id, player_id)
);

create table if not exists public.player_origin_schools (
  team_id text not null,
  player_id text not null,
  sequence integer not null,
  region text not null,
  school text not null,
  year integer not null,
  position text not null,
  updated_at timestamptz not null default now(),
  updated_by text not null,
  primary key (team_id, player_id, sequence)
);

insert into storage.buckets (id, name, public, file_size_limit)
values ('media', 'media', false, 2147483648)
on conflict (id) do update set file_size_limit = excluded.file_size_limit;

alter table public.media_items enable row level security;
alter table public.media_likes enable row level security;
alter table public.player_profile_overrides enable row level security;
alter table public.player_origin_schools enable row level security;

drop policy if exists "admins upload media" on storage.objects;
create policy "admins upload media" on storage.objects for insert to authenticated
with check (
  bucket_id = 'media' and
  lower(coalesce(auth.jwt() ->> 'email','')) in ('celebrityrecipe092@gmail.com','jangyoungkyoung76@gmail.com')
);

drop policy if exists "admins update media" on storage.objects;
create policy "admins update media" on storage.objects for update to authenticated
using (
  bucket_id = 'media' and
  lower(coalesce(auth.jwt() ->> 'email','')) in ('celebrityrecipe092@gmail.com','jangyoungkyoung76@gmail.com')
);
