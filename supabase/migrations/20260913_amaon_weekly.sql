create table if not exists public.weekly_posts (
  id uuid primary key default gen_random_uuid(),
  issue_number smallint not null unique check (issue_number between 1 and 999),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 2 and 120),
  summary text not null check (char_length(summary) between 10 and 240),
  one_issue_title text not null check (char_length(one_issue_title) between 2 and 100),
  body text not null check (char_length(body) between 20 and 5000),
  on_message text not null check (char_length(on_message) between 2 and 160),
  cover_storage_key text,
  team_id text,
  player_id text,
  player_name text,
  school_name text,
  position text,
  published boolean not null default false,
  published_at timestamptz,
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint weekly_published_player_required check (
    not published or (
      published_at is not null and cover_storage_key is not null and
      team_id is not null and player_id is not null and
      player_name is not null and school_name is not null
    )
  )
);

create index if not exists weekly_posts_public_order_idx
  on public.weekly_posts (published_at desc)
  where published = true;

create table if not exists public.weekly_clicks_daily (
  event_date date not null,
  weekly_id uuid not null references public.weekly_posts(id) on delete cascade,
  event_type text not null check (event_type in ('player_profile', 'player_video', 'profile_submission')),
  clicks bigint not null default 0 check (clicks >= 0),
  updated_at timestamptz not null default now(),
  primary key (event_date, weekly_id, event_type)
);

create index if not exists weekly_clicks_daily_weekly_id_idx
  on public.weekly_clicks_daily (weekly_id);

alter table public.weekly_posts enable row level security;
alter table public.weekly_clicks_daily enable row level security;

revoke all on table public.weekly_posts from anon, authenticated;
revoke all on table public.weekly_clicks_daily from anon, authenticated;
grant select, insert, update on table public.weekly_posts to service_role;
grant select, insert, update on table public.weekly_clicks_daily to service_role;

create or replace function public.record_weekly_click(
  p_event_date date,
  p_weekly_id uuid,
  p_event_type text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if p_event_type not in ('player_profile', 'player_video', 'profile_submission') then
    raise exception 'invalid weekly event';
  end if;

  insert into public.weekly_clicks_daily (event_date, weekly_id, event_type, clicks)
  values (p_event_date, p_weekly_id, p_event_type, 1)
  on conflict (event_date, weekly_id, event_type) do update
  set clicks = public.weekly_clicks_daily.clicks + 1,
      updated_at = now();
end;
$$;

revoke all on function public.record_weekly_click(date, uuid, text) from public, anon, authenticated;
grant execute on function public.record_weekly_click(date, uuid, text) to service_role;

insert into public.weekly_posts (
  issue_number, slug, title, summary, one_issue_title, body, on_message, created_by
)
values (
  1,
  'offseason-baseball-player',
  '시즌이 끝났다고 선수의 시간이 끝난 건 아니다.',
  '고교야구 비시즌에 플레이 영상과 현재 강점, 다음 시즌 목표를 정리해야 하는 이유를 짧게 전합니다.',
  '고교야구 비시즌과 다음 시즌 준비',
  E'시즌이 끝나면 기록표는 잠시 멈춥니다. 하지만 선수의 성장은 이때부터 다시 시작됩니다.\n\n먼저 이번 시즌의 플레이 영상을 한곳에 모아보세요. 잘된 장면만 고르기보다 투구, 타격, 수비에서 반복해서 나타난 장점과 보완할 부분을 함께 확인하는 것이 좋습니다.\n\n다음으로 지금의 강점을 한 문장으로 적어보세요. 빠른 공, 변화구 제구, 콘택트, 장타, 수비 범위처럼 자신이 보여주고 싶은 능력이 무엇인지 정리하면 훈련의 방향도 선명해집니다.\n\n진학이나 전학을 고민하고 있다면 시즌 직전에 서두르지 말고 현재 학교, 학년, 포지션과 영상 자료를 미리 정리해 두는 것이 좋습니다. 기록만으로 설명하기 어려운 움직임과 성장 가능성은 영상과 프로필이 함께 있을 때 더 정확하게 전달됩니다.\n\n비시즌은 쉬는 시간이면서 동시에 다음 시즌의 출발점입니다. 거창한 계획보다 오늘 영상 하나를 정리하고, 장점 하나와 다음 목표 하나를 적는 것부터 시작해보세요.',
  '지금 내 플레이를 정리해보세요.',
  'system-draft'
)
on conflict (issue_number) do nothing;
