create table if not exists public.weekly_images (
  id uuid primary key default gen_random_uuid(),
  weekly_id uuid not null references public.weekly_posts(id) on delete cascade,
  storage_key text not null unique,
  caption text not null default '' check (char_length(caption) <= 160),
  after_paragraph smallint not null default 1 check (after_paragraph between 0 and 100),
  sort_order smallint not null check (sort_order between 0 and 7),
  created_at timestamptz not null default now(),
  unique (weekly_id, sort_order)
);

create index if not exists weekly_images_weekly_id_idx on public.weekly_images (weekly_id);

alter table public.weekly_images enable row level security;
revoke all on table public.weekly_images from anon, authenticated;
grant select, insert, update, delete on table public.weekly_images to service_role;
