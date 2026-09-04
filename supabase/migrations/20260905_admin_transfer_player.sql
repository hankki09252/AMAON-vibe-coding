create or replace function public.admin_transfer_player(
  p_player_id text,
  p_from_team_id text,
  p_to_team_id text,
  p_school_name text,
  p_updated_by text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  affected_players integer;
begin
  if p_from_team_id = p_to_team_id then
    return;
  end if;

  if not exists (
    select 1 from public.roster_players
    where player_id = p_player_id and team_id = p_from_team_id
  ) then
    raise exception 'source player not found';
  end if;

  delete from public.player_profile_overrides
  where team_id = p_to_team_id and player_id = p_player_id;
  update public.player_profile_overrides
  set team_id = p_to_team_id, updated_at = now(), updated_by = p_updated_by
  where team_id = p_from_team_id and player_id = p_player_id;

  delete from public.player_origin_schools
  where team_id = p_to_team_id and player_id = p_player_id;
  update public.player_origin_schools
  set team_id = p_to_team_id, updated_at = now(), updated_by = p_updated_by
  where team_id = p_from_team_id and player_id = p_player_id;

  update public.media_items
  set player_id = p_to_team_id || '--' || p_player_id
  where player_id = p_from_team_id || '--' || p_player_id;

  update public.video_submissions
  set team_id = p_to_team_id, school_name = p_school_name
  where team_id = p_from_team_id and player_id = p_player_id;

  update public.player_profile_submissions
  set team_id = p_to_team_id, school_name = p_school_name
  where team_id = p_from_team_id and player_id = p_player_id;

  update public.roster_players
  set team_id = p_to_team_id, hidden = false, updated_at = now(), updated_by = p_updated_by
  where player_id = p_player_id and team_id = p_from_team_id;
  get diagnostics affected_players = row_count;
  if affected_players <> 1 then
    raise exception 'player transfer failed';
  end if;
end;
$$;

revoke all on function public.admin_transfer_player(text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.admin_transfer_player(text, text, text, text, text) to service_role;
