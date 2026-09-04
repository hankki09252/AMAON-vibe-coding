import { createSupabaseAdminClient } from "./supabase/admin";
import { publicAccess } from "./public-access";
import { validPlayerId, validTeamId } from "./api-auth";
import { presentMedia } from "./media-read";
import type { ProfileEntryData } from "./profile-entry-context";

// Request-local, never a cross-user cache: hiding a player takes effect on the next request.
// Admin-only entries retain the existing authenticated client path.
export async function readProfileEntry(team: string, player: string): Promise<ProfileEntryData | null> {
  if (!validTeamId(team) || !validPlayerId(player)) return null;
  const db = createSupabaseAdminClient();
  const [access, roster, overrides, media] = await Promise.all([
    publicAccess([player]),
    db.from("roster_players").select("player_id,origin_team_id,team_id,hidden,created,jersey_number,name,roster_year,position,grade,height,weight,bats_throws,updated_at").eq("player_id", player),
    db.from("player_profile_overrides").select("player_id,roster_year,jersey_number,grade,position,height,weight,introduction,strengths,aspiration,updated_at").eq("team_id", team).eq("player_id", player),
    db.from("media_items").select("storage_key,player_id,category,content_type,uploaded_at").in("player_id", [player, `${team}--${player}`]).order("uploaded_at", { ascending: false }).limit(1000),
  ]);
  if (roster.error || overrides.error || media.error) throw new Error("선수 정보를 준비하지 못했습니다.");
  if (!access.player(player, team)) return null;
  if ((roster.data || []).some((row) => row.hidden || row.team_id !== team)) return null;
  return {
    team, player, visibleRegions: access.visibleRegions,
    roster: (roster.data || []).map((row) => ({
      playerId: row.player_id, originTeamId: row.origin_team_id, teamId: row.team_id,
      hidden: row.hidden, created: row.created, updatedAt: row.updated_at, updatedBy: "",
      player: { id: row.player_id, number: row.jersey_number, name: row.name, year: row.roster_year, position: row.position, grade: row.grade, height: row.height, weight: row.weight, batsThrows: row.bats_throws },
    })),
    overrides: (overrides.data || []).map((row) => ({ playerId: row.player_id, year: row.roster_year, number: row.jersey_number, grade: row.grade, position: row.position, height: row.height, weight: row.weight, introduction: row.introduction, strengths: row.strengths, aspiration: row.aspiration, updatedAt: new Date(row.updated_at).getTime() })),
    media: (await presentMedia(media.data || [])).map((item) => ({ ...item, playerId: item.playerId.includes("--") ? item.playerId.slice(item.playerId.indexOf("--") + 2) : item.playerId })),
  };
}
