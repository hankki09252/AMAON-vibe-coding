alter table public.member_profiles
  add column if not exists linked_team_id text not null default '';

alter table public.member_profiles
  add column if not exists linked_player_id text not null default '';

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  author_id uuid not null references public.member_profiles(user_id) on delete cascade,
  content text not null check (char_length(content) between 1 and 500),
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists community_comments_post_created_idx
  on public.community_comments(post_id, created_at);

create table if not exists public.member_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.member_profiles(user_id) on delete cascade,
  actor_id uuid not null references public.member_profiles(user_id) on delete cascade,
  notification_type text not null check (notification_type in ('post_comment', 'media_like')),
  post_id uuid references public.community_posts(id) on delete cascade,
  comment_id uuid references public.community_comments(id) on delete cascade,
  media_key text,
  team_id text not null default '',
  player_id text not null default '',
  read_at timestamptz,
  created_at timestamptz not null default now(),
  check (recipient_id <> actor_id)
);

create index if not exists member_notifications_recipient_idx
  on public.member_notifications(recipient_id, created_at desc);

create unique index if not exists member_notifications_media_like_unique
  on public.member_notifications(recipient_id, actor_id, media_key)
  where notification_type = 'media_like';

alter table public.community_comments enable row level security;
alter table public.member_notifications enable row level security;
