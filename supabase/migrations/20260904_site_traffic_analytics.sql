create table if not exists public.site_visitors (
  visitor_hash text primary key,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.site_daily_visitors (
  visit_date date not null,
  visitor_hash text not null,
  created_at timestamptz not null default now(),
  primary key (visit_date, visitor_hash)
);

create table if not exists public.site_pageviews_daily (
  view_date date not null,
  page_path text not null,
  page_views bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (view_date, page_path)
);

alter table public.site_visitors enable row level security;
alter table public.site_daily_visitors enable row level security;
alter table public.site_pageviews_daily enable row level security;

revoke all on table public.site_visitors from anon, authenticated;
revoke all on table public.site_daily_visitors from anon, authenticated;
revoke all on table public.site_pageviews_daily from anon, authenticated;
grant select, insert, update on table public.site_visitors to service_role;
grant select, insert on table public.site_daily_visitors to service_role;
grant select, insert, update on table public.site_pageviews_daily to service_role;

create or replace function public.record_site_visit(
  p_visit_date date,
  p_page_path text,
  p_visitor_hash text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.site_visitors (visitor_hash)
  values (p_visitor_hash)
  on conflict (visitor_hash) do update
  set last_seen_at = now();

  insert into public.site_daily_visitors (visit_date, visitor_hash)
  values (p_visit_date, p_visitor_hash)
  on conflict do nothing;

  insert into public.site_pageviews_daily (view_date, page_path, page_views)
  values (p_visit_date, p_page_path, 1)
  on conflict (view_date, page_path) do update
  set page_views = public.site_pageviews_daily.page_views + 1,
      updated_at = now();
end;
$$;

revoke all on function public.record_site_visit(date, text, text) from public, anon, authenticated;
grant execute on function public.record_site_visit(date, text, text) to service_role;
