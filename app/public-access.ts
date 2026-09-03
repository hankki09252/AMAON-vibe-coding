import { createSupabaseAdminClient } from "./supabase/admin";
import { readRegionSettings } from "./region-settings";
import { managedTeamOptions } from "./team-directory";
import { schools } from "./school-catalog";
import legacyTeams from "./legacy-player-teams.json";

// This snapshot is server-only. Unknown players fail closed. Management rows
// override bundled rosters, so hidden/transferred players cannot leak via media APIs.
export async function publicAccess(playerIds?: string[]) {
  const db = createSupabaseAdminClient();
  const scope = playerIds ? new Set(playerIds.map((id) => id.includes("--") ? id.slice(id.indexOf("--") + 2) : id)) : null;
  async function readChanges() {
    const changes = new Map<string, { team_id: string; hidden: boolean }>();
    if (scope?.size === 0) return changes;
    for (let from = 0; ; from += 1000) {
      let query = db.from("roster_players").select("player_id,team_id,hidden").order("player_id");
      if (scope) query = query.in("player_id", [...scope]);
      const { data, error } = await query.range(from, from + 999);
      if (error) throw new Error("공개 선수 정보를 확인하지 못했습니다.");
      for (const row of data || []) changes.set(row.player_id, row);
      if ((data || []).length < 1000) break;
    }
    return changes;
  }
  const [settings, changes] = await Promise.all([readRegionSettings(), readChanges()]);
  const schoolRegions = new Map(schools.map((school) => [school.name, school.region]));
  const teams = new Set<string>(managedTeamOptions.filter((team) =>
    settings.visibleRegions.includes(schoolRegions.get(team.label) || "")
  ).map((team) => team.id));
  function player(id: string, expectedTeam?: string) {
    const separator = id.indexOf("--");
    const baseId = separator < 0 ? id : id.slice(separator + 2);
    if (scope && !scope.has(baseId)) return false;
    const change = changes.get(baseId);
    const team = change?.team_id || (legacyTeams as Record<string, string>)[baseId];
    return Boolean(team && !change?.hidden && teams.has(team)
      && (!expectedTeam || team === expectedTeam)
      && (separator < 0 || id.slice(0, separator) === team));
  }
  return { visibleRegions: settings.visibleRegions, team: (id: string) => teams.has(id), player,
    media: (key: string) => key.startsWith("teams/") ? teams.has(key.split("/")[1]) : player(key.split("/")[1] || "") };
}
