create table if not exists public.player_spotlights (
  id uuid primary key default gen_random_uuid(),
  team_id text not null,
  player_id text not null,
  player_name text not null check (char_length(player_name) between 1 and 80),
  school_name text not null check (char_length(school_name) between 1 and 100),
  platform text not null check (platform in ('instagram', 'threads', 'blog')),
  post_url text not null unique check (char_length(post_url) between 12 and 500),
  title text not null check (char_length(title) between 1 and 120),
  summary text not null default '' check (char_length(summary) <= 240),
  published boolean not null default false,
  sort_order smallint not null default 0 check (sort_order between 0 and 999),
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists player_spotlights_public_order_idx
  on public.player_spotlights (sort_order, created_at desc)
  where published = true;

alter table public.player_spotlights enable row level security;
revoke all on table public.player_spotlights from anon, authenticated;
grant select, insert, update, delete on table public.player_spotlights to service_role;
