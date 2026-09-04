create table if not exists public.video_submissions (
  id uuid primary key default gen_random_uuid(),
  team_id text not null,
  player_id text not null,
  player_name text not null,
  school_name text not null,
  category text not null check (category in ('pitching', 'batting', 'fielding')),
  relationship text not null check (relationship in ('player', 'guardian')),
  contact text not null check (char_length(contact) between 5 and 80),
  consent boolean not null default false check (consent = true),
  original_name text not null,
  storage_key text not null unique,
  content_type text not null,
  file_size bigint not null check (file_size > 0 and file_size <= 157286400),
  duration_seconds integer not null check (duration_seconds > 0 and duration_seconds <= 90),
  requester_hash text not null,
  status text not null default 'uploading' check (status in ('uploading', 'pending', 'approved', 'rejected')),
  review_reason text not null default '',
  created_at timestamptz not null default now(),
  uploaded_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by text
);

create index if not exists video_submissions_status_created_idx
  on public.video_submissions (status, created_at desc);
create index if not exists video_submissions_requester_created_idx
  on public.video_submissions (requester_hash, created_at desc);

alter table public.video_submissions enable row level security;
revoke all on table public.video_submissions from anon, authenticated;
grant select, insert, update, delete on table public.video_submissions to service_role;
