import { publicAccess } from "../../public-access";
import { apiAdmin, validPlayerId, validTeamId } from "../../api-auth";
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

type RosterPlayerRow = {
  player_id: string;
  origin_team_id: string;
  team_id: string;
  hidden: boolean;
  created: boolean;
  jersey_number: string;
  name: string;
  roster_year: number;
  position: string;
  grade: string;
  height: number;
  weight: number;
  bats_throws: string;
  updated_at: string;
  updated_by: string;
};

function toRow(item: ManagedRosterPlayer): RosterPlayerRow {
  return {
    player_id: item.playerId,
    origin_team_id: item.originTeamId,
    team_id: item.teamId,
    hidden: item.hidden,
    created: item.created,
    jersey_number: item.player.number,
    name: item.player.name,
    roster_year: item.player.year,
    position: item.player.position,
    grade: item.player.grade,
    height: item.player.height,
    weight: item.player.weight,
    bats_throws: item.player.batsThrows,
    updated_at: item.updatedAt,
    updated_by: item.updatedBy,
  };
}

function fromRow(row: RosterPlayerRow): ManagedRosterPlayer {
  return {
    playerId: row.player_id,
    originTeamId: row.origin_team_id,
    teamId: row.team_id,
    hidden: row.hidden,
    created: row.created,
    player: {
      id: row.player_id,
      number: row.jersey_number,
      name: row.name,
      year: row.roster_year,
      position: row.position,
      grade: row.grade,
      height: row.height,
      weight: row.weight,
      batsThrows: row.bats_throws,
    },
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

async function readTableItems(playerId?: string): Promise<ManagedRosterPlayer[]> {
  const db = createSupabaseAdminClient();
  const items: ManagedRosterPlayer[] = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    let query = db
      .from("roster_players")
      .select("*")
      .order("player_id");
    if (playerId) query = query.eq("player_id", playerId);
    const { data, error } = await query.range(from, from + pageSize - 1);
    if (error) throw new Error(`선수 기록 테이블을 읽지 못했습니다: ${error.message}`);
    const rows = (data || []) as RosterPlayerRow[];
    items.push(...rows.map(fromRow));
    if (rows.length < pageSize) break;
  }
  return items;
}

async function readLegacyItems(): Promise<ManagedRosterPlayer[]> {
  const db = createSupabaseAdminClient();
  const { data, error } = await db.storage.from("media").download(SETTINGS_FILE);
  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("not found") || message.includes("does not exist")) return [];
    throw new Error(`기존 선수 기록을 읽지 못했습니다: ${error.message}`);
  }
  if (!data) throw new Error("기존 선수 기록 파일의 내용이 비어 있습니다.");
  try {
    const parsed = JSON.parse(await data.text());
    return Array.isArray(parsed?.items) ? parsed.items : [];
  } catch (error) {
    throw new Error(`기존 선수 기록 형식이 손상되었습니다: ${error instanceof Error ? error.message : "JSON 오류"}`);
  }
}

async function saveItems(items: ManagedRosterPlayer[]) {
  if (!items.length) return;
  const db = createSupabaseAdminClient();
  const { error } = await db.from("roster_players").upsert(items.map(toRow), { onConflict: "player_id" });
  if (error) throw new Error(error.message);
}

async function readItems(): Promise<ManagedRosterPlayer[]> {
  const items = await readTableItems();
  if (items.length) return items;

  // 첫 실행 때만 기존 Storage JSON을 새 테이블로 복사한다.
  // 이후부터는 테이블만 사용하며 JSON 파일은 비상 백업으로 그대로 남긴다.
  const legacyItems = await readLegacyItems();
  if (!legacyItems.length) return [];
  await saveItems(legacyItems);
  return readTableItems();
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

async function migratePlayerDetails(playerId: string, fromTeamId: string, toTeamId: string, updatedBy: string) {
  if (fromTeamId === toTeamId) return;
  const db = createSupabaseAdminClient();
  const { error } = await db.rpc("admin_transfer_player", {
    p_player_id: playerId,
    p_from_team_id: fromTeamId,
    p_to_team_id: toTeamId,
    p_school_name: managedTeamLabel[toTeamId],
    p_updated_by: updatedBy,
  });
  if (error) throw new Error(error.message);
}

export async function GET(request: Request) {
  const playerId = new URL(request.url).searchParams.get("playerId") || undefined;
  if (playerId && !validPlayerId(playerId)) return Response.json({ error: "선수 정보가 올바르지 않습니다." }, { status: 400 });
  const { role } = await apiAdmin();
  const [items, access] = await Promise.all([
    readTableItems(playerId), role ? null : publicAccess(playerId ? [playerId] : undefined),
  ]);
  const publicItems = items.map((item) => access && !access.player(item.playerId)
    ? { playerId: item.playerId, teamId: item.teamId, originTeamId: item.originTeamId, hidden: true }
    : role ? item : { ...item, updatedBy: "" });
  return Response.json({ items: publicItems }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  const { user, role } = await apiAdmin();
  if (!user || !role) return Response.json({ error: "운영자만 선수를 추가할 수 있습니다." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const teamId = String(body?.teamId || "");
  if (!validTeamId(teamId) || !managedTeamLabel[teamId]) return Response.json({ error: "학교 정보가 올바르지 않습니다." }, { status: 400 });
  const incoming = Array.isArray(body?.players) ? body.players : [body?.player];
  if (!incoming.length || incoming.length > 150) return Response.json({ error: "한 번에 1명부터 150명까지 등록할 수 있습니다." }, { status: 400 });
  const now = new Date().toISOString();
  const parsed = incoming.map((value) => {
    const playerId = `custom-${crypto.randomUUID()}`;
    const player = parsePlayer(value, playerId);
    return player ? { playerId, originTeamId: teamId, teamId, hidden: false, created: true, player, updatedAt: now, updatedBy: user.email || "" } satisfies ManagedRosterPlayer : null;
  });
  if (parsed.some((item) => !item)) return Response.json({ error: "선수 이름·학년·포지션·신체정보를 확인해 주세요." }, { status: 400 });
  const newItems = parsed as ManagedRosterPlayer[];
  try {
    const items = await readItems();
    const teamItems = items.filter((item) => item.teamId === teamId);
    const existingKeys = new Set(teamItems.map((item) => `${item.player.name}|${item.player.number}`));
    const correctedItems: ManagedRosterPlayer[] = [];
    const correctedIds = new Set<string>();
    const uniqueItems = newItems.filter((item, index) => {
      const key = `${item.player.name}|${item.player.number}`;
      if (existingKeys.has(key) || newItems.findIndex((candidate) => `${candidate.player.name}|${candidate.player.number}` === key) !== index) return false;
      const sameNameMatches = teamItems.filter((current) =>
        current.created
        && !correctedIds.has(current.playerId)
        && current.player.name === item.player.name
      );
      const numberCorrectionMatch = sameNameMatches.length === 1
        && item.player.number !== "미정"
        && sameNameMatches[0].player.number !== item.player.number
        ? sameNameMatches[0]
        : null;
      if (numberCorrectionMatch) {
        correctedIds.add(numberCorrectionMatch.playerId);
        correctedItems.push({
          ...numberCorrectionMatch,
          player: { ...numberCorrectionMatch.player, number: item.player.number },
          updatedAt: now,
          updatedBy: user.email || "",
        });
        return false;
      }
      existingKeys.add(key);
      return true;
    });
    const savedItems = [...correctedItems, ...uniqueItems];
    if (!savedItems.length) return Response.json({ error: "새로 등록하거나 등번호를 보정할 선수가 없습니다. 이미 등록된 이름과 등번호를 확인해 주세요." }, { status: 409 });
    await saveItems(savedItems);
    return Response.json({
      item: savedItems[0],
      items: savedItems,
      corrected: correctedItems.length,
      created: uniqueItems.length,
      skipped: newItems.length - savedItems.length,
    });
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
    if (fromTeamId !== teamId) await migratePlayerDetails(playerId, fromTeamId, teamId, user.email || "");
    await saveItems([item]);
    return Response.json({ item });
  } catch (error) {
    return Response.json({ error: `변경사항을 저장하지 못했습니다: ${error instanceof Error ? error.message : "저장 오류"}` }, { status: 500 });
  }
}
