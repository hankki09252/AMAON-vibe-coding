alter table public.video_submissions
  add column if not exists social_consent boolean not null default false;

create table if not exists public.player_profile_submissions (
  id uuid primary key default gen_random_uuid(),
  team_id text not null,
  player_id text not null,
  player_name text not null,
  school_name text not null,
  submission_type text not null check (submission_type in ('profile', 'profile_photo', 'photo')),
  relationship text not null check (relationship in ('player', 'guardian')),
  contact text not null check (char_length(contact) between 5 and 80),
  consent boolean not null default false check (consent = true),
  social_consent boolean not null default false,
  profile_data jsonb not null default '{}'::jsonb check (jsonb_typeof(profile_data) = 'object'),
  original_name text not null default '',
  storage_key text unique,
  content_type text not null default 'application/json',
  file_size bigint not null default 0 check (file_size between 0 and 12582912),
  requester_hash text not null,
  status text not null default 'uploading' check (status in ('uploading', 'pending', 'approved', 'rejected')),
  review_reason text not null default '',
  created_at timestamptz not null default now(),
  uploaded_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by text,
  constraint player_profile_submission_payload_check check (
    (submission_type = 'profile' and storage_key is null and file_size = 0 and content_type = 'application/json')
    or
    (submission_type in ('profile_photo', 'photo') and storage_key is not null and file_size > 0 and content_type in ('image/jpeg', 'image/png', 'image/webp'))
  )
);

create index if not exists player_profile_submissions_status_created_idx
  on public.player_profile_submissions (status, created_at desc);
create index if not exists player_profile_submissions_requester_created_idx
  on public.player_profile_submissions (requester_hash, created_at desc);

alter table public.player_profile_submissions enable row level security;
revoke all on table public.player_profile_submissions from anon, authenticated;
grant select, insert, update, delete on table public.player_profile_submissions to service_role;
