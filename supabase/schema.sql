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

-- 선수 추가·숨김·전학 기록은 선수 한 명당 한 행으로 저장한다.
-- 예전처럼 Storage의 JSON 파일 전체를 덮어쓰지 않으므로 동시에 수정해도
-- 다른 선수의 기록이 사라지지 않는다.
create table if not exists public.roster_players (
  player_id text primary key,
  origin_team_id text not null,
  team_id text not null,
  hidden boolean not null default false,
  created boolean not null default false,
  jersey_number text not null default '미정',
  name text not null,
  roster_year integer not null default 2026,
  position text not null,
  grade text not null,
  height integer not null,
  weight integer not null,
  bats_throws text not null,
  updated_at timestamptz not null default now(),
  updated_by text not null
);

create index if not exists roster_players_team_id_idx on public.roster_players (team_id);
create index if not exists roster_players_origin_team_id_idx on public.roster_players (origin_team_id);

-- 회원 신원 배지와 커뮤니티 활동 등급은 분리해 관리한다.
create table if not exists public.member_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  display_name text not null,
  member_role text not null default 'fan' check (member_role in ('player','guardian','coach','baseball_staff','fan')),
  school_name text not null default '',
  related_player_name text not null default '',
  identity_status text not null default 'pending' check (identity_status in ('pending','verified','rejected')),
  activity_points integer not null default 0,
  suspended_until timestamptz,
  verified_at timestamptz,
  verified_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.member_profiles(user_id) on delete cascade,
  category text not null check (category in ('free','cheer','news','question','training','report')),
  title text not null,
  content text not null,
  hidden boolean not null default false,
  moderated_at timestamptz,
  moderated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists community_posts_created_at_idx on public.community_posts (created_at desc);
create index if not exists community_posts_category_idx on public.community_posts (category);

create table if not exists public.community_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.member_profiles(user_id) on delete cascade,
  post_id uuid not null references public.community_posts(id) on delete cascade,
  reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  unique (reporter_id, post_id)
);

create table if not exists public.community_blocks (
  user_id uuid not null references public.member_profiles(user_id) on delete cascade,
  blocked_user_id uuid not null references public.member_profiles(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, blocked_user_id),
  check (user_id <> blocked_user_id)
);

insert into storage.buckets (id, name, public, file_size_limit)
values ('media', 'media', false, 2147483648)
on conflict (id) do update set file_size_limit = excluded.file_size_limit;

alter table public.media_items enable row level security;
alter table public.media_likes enable row level security;
alter table public.player_profile_overrides enable row level security;
alter table public.player_origin_schools enable row level security;
alter table public.roster_players enable row level security;
alter table public.member_profiles enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_reports enable row level security;
alter table public.community_blocks enable row level security;

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
