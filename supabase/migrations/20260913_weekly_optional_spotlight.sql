alter table public.weekly_posts
  drop constraint if exists weekly_published_player_required;

alter table public.weekly_posts
  add constraint weekly_published_timestamp_required
  check (not published or published_at is not null);

alter table public.weekly_posts
  add constraint weekly_player_fields_complete
  check (
    (team_id is null and player_id is null and player_name is null and school_name is null)
    or (team_id is not null and player_id is not null and player_name is not null and school_name is not null)
  );
