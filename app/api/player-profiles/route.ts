import { env } from "cloudflare:workers";
import { isAdminRequest, isAuthenticatedRequest } from "../../admin";

type Statement = {
  bind(...values: unknown[]): Statement;
  run(): Promise<unknown>;
  all<T>(): Promise<{ results: T[] }>;
};

type Database = {
  prepare(sql: string): Statement;
};

let schemaReady: Promise<void> | null = null;

function database() {
  return (env as unknown as { DB: Database }).DB;
}

function ensureSchema() {
  if (!schemaReady) {
    schemaReady = database().prepare(
      "CREATE TABLE IF NOT EXISTS player_profile_overrides (team_id TEXT NOT NULL, player_id TEXT NOT NULL, position TEXT NOT NULL, height INTEGER NOT NULL, weight INTEGER NOT NULL, introduction TEXT NOT NULL DEFAULT '', strengths TEXT NOT NULL DEFAULT '', aspiration TEXT NOT NULL DEFAULT '', updated_at INTEGER NOT NULL, updated_by TEXT NOT NULL, PRIMARY KEY (team_id, player_id))",
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

export async function GET(request: Request) {
  if (!isAuthenticatedRequest(request)) return Response.json({ error: "회원 로그인 후 이용할 수 있습니다." }, { status: 401 });
  const teamId = new URL(request.url).searchParams.get("teamId") ?? "";
  if (!isTeamId(teamId)) return Response.json({ error: "학교 정보가 올바르지 않습니다." }, { status: 400 });
  await ensureSchema();
  const result = await database().prepare(
    "SELECT player_id, position, height, weight, introduction, strengths, aspiration, updated_at FROM player_profile_overrides WHERE team_id = ?",
  ).bind(teamId).all<{ player_id: string; position: string; height: number; weight: number; introduction: string; strengths: string; aspiration: string; updated_at: number }>();
  return Response.json({
    items: result.results.map((item) => ({
      playerId: item.player_id,
      position: item.position,
      height: Number(item.height),
      weight: Number(item.weight),
      introduction: item.introduction,
      strengths: item.strengths,
      aspiration: item.aspiration,
      updatedAt: Number(item.updated_at),
    })),
  }, { headers: { "cache-control": "no-store" } });
}

export async function PUT(request: Request) {
  if (!isAdminRequest(request)) return Response.json({ error: "운영자와 부운영자만 선수 정보를 수정할 수 있습니다." }, { status: 403 });
  const body = await request.json() as { teamId?: string; playerId?: string; position?: string; height?: number; weight?: number; introduction?: string; strengths?: string; aspiration?: string };
  const teamId = body.teamId ?? "";
  const playerId = body.playerId ?? "";
  const position = (body.position ?? "").trim();
  const height = Number(body.height);
  const weight = Number(body.weight);
  const introduction = (body.introduction ?? "").trim();
  const strengths = (body.strengths ?? "").trim();
  const aspiration = (body.aspiration ?? "").trim();
  if (!isTeamId(teamId) || !isPlayerId(playerId)) return Response.json({ error: "선수 또는 학교 정보가 올바르지 않습니다." }, { status: 400 });
  if (position.length < 1 || position.length > 20) return Response.json({ error: "포지션은 1~20자로 입력해 주세요." }, { status: 400 });
  if (!Number.isInteger(height) || height < 100 || height > 230) return Response.json({ error: "키는 100~230cm 사이의 정수로 입력해 주세요." }, { status: 400 });
  if (!Number.isInteger(weight) || weight < 30 || weight > 200) return Response.json({ error: "몸무게는 30~200kg 사이의 정수로 입력해 주세요." }, { status: 400 });
  if (introduction.length > 500) return Response.json({ error: "자기소개는 500자 이하로 입력해 주세요." }, { status: 400 });
  if (strengths.length > 300) return Response.json({ error: "나의 장점은 300자 이하로 입력해 주세요." }, { status: 400 });
  if (aspiration.length > 300) return Response.json({ error: "목표와 포부는 300자 이하로 입력해 주세요." }, { status: 400 });
  await ensureSchema();
  const updatedAt = Date.now();
  const updatedBy = request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase() ?? "admin";
  await database().prepare(
    "INSERT INTO player_profile_overrides (team_id, player_id, position, height, weight, introduction, strengths, aspiration, updated_at, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(team_id, player_id) DO UPDATE SET position = excluded.position, height = excluded.height, weight = excluded.weight, introduction = excluded.introduction, strengths = excluded.strengths, aspiration = excluded.aspiration, updated_at = excluded.updated_at, updated_by = excluded.updated_by",
  ).bind(teamId, playerId, position, height, weight, introduction, strengths, aspiration, updatedAt, updatedBy).run();
  return Response.json({ playerId, position, height, weight, introduction, strengths, aspiration, updatedAt });
}

export async function DELETE(request: Request) {
  if (!isAdminRequest(request)) return Response.json({ error: "운영자와 부운영자만 선수 정보를 수정할 수 있습니다." }, { status: 403 });
  const url = new URL(request.url);
  const teamId = url.searchParams.get("teamId") ?? "";
  const playerId = url.searchParams.get("playerId") ?? "";
  if (!isTeamId(teamId) || !isPlayerId(playerId)) return Response.json({ error: "선수 또는 학교 정보가 올바르지 않습니다." }, { status: 400 });
  await ensureSchema();
  await database().prepare("DELETE FROM player_profile_overrides WHERE team_id = ? AND player_id = ?").bind(teamId, playerId).run();
  return new Response(null, { status: 204 });
}
