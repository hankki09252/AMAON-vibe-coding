import catalog from "./legacy-player-catalog.json";
import { publicAccess } from "./public-access";
import { createSupabaseAdminClient } from "./supabase/admin";

type Database = ReturnType<typeof createSupabaseAdminClient>;
type StaticPlayer = {
  teamId: string; name: string; number: string; year: number; position: string;
  grade: string; height: number; weight: number; batsThrows: string;
};

function staticPlayer(teamId: string, playerId: string) {
  const player = (catalog as Record<string, StaticPlayer>)[playerId];
  return player?.teamId === teamId ? player : null;
}

export async function resolveSubmissionPlayer(db: Database, teamId: string, playerId: string) {
  // A managed record takes precedence over the bundled roster, including a hide or transfer.
  const { data: managed, error } = await db.from("roster_players")
    .select("player_id,team_id,name,hidden").eq("player_id", playerId).maybeSingle();
  if (error) throw error;
  if (managed && (managed.hidden || managed.team_id !== teamId)) return null;
  const player = managed || staticPlayer(teamId, playerId);
  if (!player) return null;
  const access = await publicAccess([playerId]);
  return access.player(playerId, teamId) ? { name: player.name } : null;
}

export async function ensureProfileRosterPlayer(db: Database, teamId: string, playerId: string, updatedBy: string) {
  const player = staticPlayer(teamId, playerId);
  if (player) {
    const { error } = await db.from("roster_players").upsert({
      player_id: playerId, origin_team_id: teamId, team_id: teamId,
      hidden: false, created: false, jersey_number: player.number,
      name: player.name, roster_year: player.year, position: player.position,
      grade: player.grade, height: player.height, weight: player.weight,
      bats_throws: player.batsThrows, updated_by: updatedBy,
    }, { onConflict: "player_id", ignoreDuplicates: true });
    if (error) throw error;
  }
  const { data: current, error } = await db.from("roster_players")
    .select("player_id,team_id,hidden").eq("player_id", playerId).maybeSingle();
  if (error) throw error;
  return current?.team_id === teamId && !current.hidden;
}
