import { apiAdmin, apiUser, validPlayerId, validTeamId } from "../../api-auth";
import { createSupabaseAdminClient } from "../../supabase/admin";

type Origin = { region?: string; school?: string; year?: number; position?: string };

export async function GET(request: Request) {
  if (!await apiUser()) return Response.json({ error: "회원 로그인이 필요합니다." }, { status: 401 });
  const teamId = new URL(request.url).searchParams.get("teamId") || "";
  if (!validTeamId(teamId)) return Response.json({ error: "학교 정보가 올바르지 않습니다." }, { status: 400 });
  const { data, error } = await createSupabaseAdminClient().from("player_origin_schools").select("*").eq("team_id", teamId).order("sequence");
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ items: (data || []).map((item) => ({ playerId: item.player_id, sequence: item.sequence, region: item.region, school: item.school, year: item.year, position: item.position })) }, { headers: { "cache-control": "no-store" } });
}

export async function PUT(request: Request) {
  const { user, role } = await apiAdmin();
  if (!user || !role) return Response.json({ error: "운영자만 출신학교를 편집할 수 있습니다." }, { status: 403 });
  const body = await request.json() as { teamId?: string; playerId?: string; items?: Origin[] };
  const teamId = body.teamId || "", playerId = body.playerId || "";
  if (!validTeamId(teamId) || !validPlayerId(playerId) || !Array.isArray(body.items) || body.items.length > 10) return Response.json({ error: "입력 정보를 확인해 주세요." }, { status: 400 });
  const rows = body.items.map((item, sequence) => ({ team_id: teamId, player_id: playerId, sequence, region: String(item.region || "").trim(), school: String(item.school || "").trim(), year: Number(item.year), position: String(item.position || "").trim(), updated_by: user.email }));
  if (rows.some((item) => !item.region || !item.school || !Number.isInteger(item.year) || item.year < 1950 || item.year > 2100 || !item.position)) return Response.json({ error: "출신학교 항목을 모두 입력해 주세요." }, { status: 400 });
  const db = createSupabaseAdminClient();
  await db.from("player_origin_schools").delete().eq("team_id", teamId).eq("player_id", playerId);
  if (rows.length) {
    const { error } = await db.from("player_origin_schools").insert(rows);
    if (error) return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ playerId, items: rows.map(({ region, school, year, position }, sequence) => ({ region, school, year, position, sequence })) });
}
