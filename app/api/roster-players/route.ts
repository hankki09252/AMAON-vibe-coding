import { apiAdmin, apiUser, validPlayerId, validTeamId } from "../../api-auth";
import { createSupabaseAdminClient } from "../../supabase/admin";
import { managedTeamLabel } from "../../team-directory";

const SETTINGS_FILE = "site-settings/roster-player-management.json";

type StoredPlayer = {
  id: string;
  number: string;
  name: string;
  year: number;
  position: string;
  grade: string;
  height: number;
  weight: number;
  batsThrows: string;
};

type ManagedRosterPlayer = {
  playerId: string;
  originTeamId: string;
  teamId: string;
  hidden: boolean;
  created: boolean;
  player: StoredPlayer;
  updatedAt: string;
  updatedBy: string;
};

async function readItems(): Promise<ManagedRosterPlayer[]> {
  const db = createSupabaseAdminClient();
  const { data, error } = await db.storage.from("media").download(SETTINGS_FILE);
  if (error || !data) return [];
  try {
    const parsed = JSON.parse(await data.text());
    return Array.isArray(parsed?.items) ? parsed.items : [];
  } catch {
    return [];
  }
}

async function writeItems(items: ManagedRosterPlayer[]) {
  const db = createSupabaseAdminClient();
  const { error } = await db.storage.from("media").upload(
    SETTINGS_FILE,
    JSON.stringify({ items, updatedAt: new Date().toISOString() }),
    { contentType: "application/json; charset=utf-8", upsert: true },
  );
  if (error) throw new Error(error.message);
}

function parsePlayer(value: unknown, forcedId?: string): StoredPlayer | null {
  const item = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const id = forcedId || String(item.id || "");
  const player: StoredPlayer = {
    id,
    number: String(item.number || "미정").trim(),
    name: String(item.name || "").trim(),
    year: Number(item.year || 2026),
    position: String(item.position || "").trim(),
    grade: String(item.grade || "").trim(),
    height: Number(item.height),
    weight: Number(item.weight),
    batsThrows: String(item.batsThrows || "").trim(),
  };
  if (!validPlayerId(player.id) || player.name.length < 1 || player.name.length > 30) return null;
  if (player.number.length > 3 || player.position.length < 1 || player.position.length > 20) return null;
  if (!["1학년", "2학년", "3학년", "졸업"].includes(player.grade)) return null;
  if (!Number.isInteger(player.year) || player.year < 2000 || player.year > 2100) return null;
  if (!Number.isInteger(player.height) || player.height < 100 || player.height > 230) return null;
  if (!Number.isInteger(player.weight) || player.weight < 30 || player.weight > 200) return null;
  if (player.batsThrows.length < 2 || player.batsThrows.length > 20) return null;
  return player;
}

async function migratePlayerDetails(playerId: string, fromTeamId: string, toTeamId: string) {
  if (fromTeamId === toTeamId) return;
  const db = createSupabaseAdminClient();
  const { data: profile } = await db.from("player_profile_overrides").select("*").eq("team_id", fromTeamId).eq("player_id", playerId).maybeSingle();
  if (profile) {
    const { team_id: _oldTeam, ...rest } = profile;
    const { error } = await db.from("player_profile_overrides").upsert({ ...rest, team_id: toTeamId }, { onConflict: "team_id,player_id" });
    if (error) throw new Error(error.message);
    await db.from("player_profile_overrides").delete().eq("team_id", fromTeamId).eq("player_id", playerId);
  }

  const { data: origins } = await db.from("player_origin_schools").select("*").eq("team_id", fromTeamId).eq("player_id", playerId).order("sequence");
  if (origins?.length) {
    const rows = origins.map(({ team_id: _oldTeam, ...rest }) => ({ ...rest, team_id: toTeamId }));
    const { error } = await db.from("player_origin_schools").upsert(rows, { onConflict: "team_id,player_id,sequence" });
    if (error) throw new Error(error.message);
    await db.from("player_origin_schools").delete().eq("team_id", fromTeamId).eq("player_id", playerId);
  }
}

export async function GET() {
  if (!await apiUser()) return Response.json({ error: "회원 로그인이 필요합니다." }, { status: 401 });
  return Response.json({ items: await readItems() }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  const { user, role } = await apiAdmin();
  if (!user || !role) return Response.json({ error: "운영자만 선수를 추가할 수 있습니다." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const teamId = String(body?.teamId || "");
  if (!validTeamId(teamId) || !managedTeamLabel[teamId]) return Response.json({ error: "학교 정보가 올바르지 않습니다." }, { status: 400 });
  const playerId = `custom-${crypto.randomUUID()}`;
  const player = parsePlayer(body?.player, playerId);
  if (!player) return Response.json({ error: "선수 이름·학년·포지션·신체정보를 확인해 주세요." }, { status: 400 });
  const item: ManagedRosterPlayer = { playerId, originTeamId: teamId, teamId, hidden: false, created: true, player, updatedAt: new Date().toISOString(), updatedBy: user.email || "" };
  try {
    const items = await readItems();
    await writeItems([...items.filter((current) => current.playerId !== playerId), item]);
    return Response.json({ item });
  } catch (error) {
    return Response.json({ error: `선수를 저장하지 못했습니다: ${error instanceof Error ? error.message : "저장 오류"}` }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { user, role } = await apiAdmin();
  if (!user || !role) return Response.json({ error: "운영자만 선수 소속과 공개 상태를 변경할 수 있습니다." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const playerId = String(body?.playerId || "");
  const originTeamId = String(body?.originTeamId || "");
  const fromTeamId = String(body?.fromTeamId || "");
  const teamId = String(body?.teamId || "");
  const player = parsePlayer(body?.player, playerId);
  if (!validPlayerId(playerId) || !validTeamId(originTeamId) || !validTeamId(fromTeamId) || !validTeamId(teamId) || !managedTeamLabel[teamId] || !player) {
    return Response.json({ error: "선수 또는 학교 정보가 올바르지 않습니다." }, { status: 400 });
  }
  const item: ManagedRosterPlayer = {
    playerId,
    originTeamId,
    teamId,
    hidden: Boolean(body?.hidden),
    created: Boolean(body?.created),
    player,
    updatedAt: new Date().toISOString(),
    updatedBy: user.email || "",
  };
  try {
    if (fromTeamId !== teamId) await migratePlayerDetails(playerId, fromTeamId, teamId);
    const items = await readItems();
    await writeItems([...items.filter((current) => current.playerId !== playerId), item]);
    return Response.json({ item });
  } catch (error) {
    return Response.json({ error: `변경사항을 저장하지 못했습니다: ${error instanceof Error ? error.message : "저장 오류"}` }, { status: 500 });
  }
}
