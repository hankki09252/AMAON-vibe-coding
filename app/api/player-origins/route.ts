import { env } from "cloudflare:workers";
import { isAdminRequest, isAuthenticatedRequest } from "../../admin";

type Statement = {
  bind(...values: unknown[]): Statement;
  run(): Promise<unknown>;
  all<T>(): Promise<{ results: T[] }>;
};

type Database = {
  prepare(sql: string): Statement;
  batch(statements: Statement[]): Promise<unknown>;
};

let schemaReady: Promise<void> | null = null;

function database() {
  return (env as unknown as { DB: Database }).DB;
}

function ensureSchema() {
  if (!schemaReady) {
    schemaReady = database().prepare(
      "CREATE TABLE IF NOT EXISTS player_origin_schools (team_id TEXT NOT NULL, player_id TEXT NOT NULL, sequence INTEGER NOT NULL, region TEXT NOT NULL, school TEXT NOT NULL, year INTEGER NOT NULL, position TEXT NOT NULL, updated_at INTEGER NOT NULL, updated_by TEXT NOT NULL, PRIMARY KEY (team_id, player_id, sequence))",
    ).run().then(() => undefined);
  }
  return schemaReady;
}

function isTeamId(value: string) {
  return /^[a-z0-9][a-z0-9-]{1,62}-roster$/.test(value);
}

function isPlayerId(value: string) {
  return /^[A-Za-z0-9-]{1,80}$/.test(value);
}

type OriginInput = { region?: string; school?: string; year?: number; position?: string };

function normalizeItem(item: OriginInput) {
  return {
    region: (item.region ?? "").trim(),
    school: (item.school ?? "").trim(),
    year: Number(item.year),
    position: (item.position ?? "").trim(),
  };
}

export async function GET(request: Request) {
  if (!isAuthenticatedRequest(request)) return Response.json({ error: "회원 로그인 후 이용할 수 있습니다." }, { status: 401 });
  const teamId = new URL(request.url).searchParams.get("teamId") ?? "";
  if (!isTeamId(teamId)) return Response.json({ error: "학교 정보가 올바르지 않습니다." }, { status: 400 });
  await ensureSchema();
  const result = await database().prepare(
    "SELECT player_id, sequence, region, school, year, position FROM player_origin_schools WHERE team_id = ? ORDER BY player_id, sequence",
  ).bind(teamId).all<{ player_id: string; sequence: number; region: string; school: string; year: number; position: string }>();
  return Response.json({
    items: result.results.map((item) => ({ playerId: item.player_id, sequence: Number(item.sequence), region: item.region, school: item.school, year: Number(item.year), position: item.position })),
  }, { headers: { "cache-control": "no-store" } });
}

export async function PUT(request: Request) {
  if (!isAdminRequest(request)) return Response.json({ error: "운영자와 부운영자만 출신학교를 편집할 수 있습니다." }, { status: 403 });
  const body = await request.json() as { teamId?: string; playerId?: string; items?: OriginInput[] };
  const teamId = body.teamId ?? "";
  const playerId = body.playerId ?? "";
  if (!isTeamId(teamId) || !isPlayerId(playerId)) return Response.json({ error: "선수 또는 학교 정보가 올바르지 않습니다." }, { status: 400 });
  if (!Array.isArray(body.items) || body.items.length > 10) return Response.json({ error: "출신학교는 선수당 최대 10개까지 등록할 수 있습니다." }, { status: 400 });
  const items = body.items.map(normalizeItem);
  for (const item of items) {
    if (item.region.length < 1 || item.region.length > 30) return Response.json({ error: "지역은 1~30자로 입력해 주세요." }, { status: 400 });
    if (item.school.length < 1 || item.school.length > 60) return Response.json({ error: "학교명은 1~60자로 입력해 주세요." }, { status: 400 });
    if (!Number.isInteger(item.year) || item.year < 1950 || item.year > 2100) return Response.json({ error: "연도는 1950~2100 사이로 입력해 주세요." }, { status: 400 });
    if (item.position.length < 1 || item.position.length > 20) return Response.json({ error: "포지션은 1~20자로 입력해 주세요." }, { status: 400 });
  }
  await ensureSchema();
  const db = database();
  const updatedAt = Date.now();
  const updatedBy = request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase() ?? "admin";
  const statements: Statement[] = [db.prepare("DELETE FROM player_origin_schools WHERE team_id = ? AND player_id = ?").bind(teamId, playerId)];
  items.forEach((item, index) => {
    statements.push(db.prepare(
      "INSERT INTO player_origin_schools (team_id, player_id, sequence, region, school, year, position, updated_at, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ).bind(teamId, playerId, index, item.region, item.school, item.year, item.position, updatedAt, updatedBy));
  });
  await db.batch(statements);
  return Response.json({ playerId, items: items.map((item, sequence) => ({ ...item, sequence })) });
}
