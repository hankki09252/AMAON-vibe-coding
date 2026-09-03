import { publicAccess } from "../../public-access";
import { apiAdmin, validPlayerId, validTeamId } from "../../api-auth";
import { createSupabaseAdminClient } from "../../supabase/admin";

export async function GET(request: Request) {
  const { role } = await apiAdmin();
  const teamId = new URL(request.url).searchParams.get("teamId") || "";
  const playerId = new URL(request.url).searchParams.get("playerId") || undefined;
  if (!validTeamId(teamId)) return Response.json({ error: "학교 정보가 올바르지 않습니다." }, { status: 400 });
  if (playerId && !validPlayerId(playerId)) return Response.json({ error: "선수 정보가 올바르지 않습니다." }, { status: 400 });
  const db = createSupabaseAdminClient();
  let query = db.from("player_profile_overrides").select("*").eq("team_id", teamId);
  if (playerId) query = query.eq("player_id", playerId);
  const [{ data, error }, access] = await Promise.all([
    query, role ? null : publicAccess(playerId ? [playerId] : undefined),
  ]);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ items: (data || []).filter((item) => !access || access.player(item.player_id, teamId)).map((item) => ({ playerId: item.player_id, year: item.roster_year, number: item.jersey_number, grade: item.grade, position: item.position, height: item.height, weight: item.weight, introduction: item.introduction, strengths: item.strengths, aspiration: item.aspiration, updatedAt: new Date(item.updated_at).getTime() })) }, { headers: { "cache-control": "no-store" } });
}

export async function PUT(request: Request) {
  const { user, role } = await apiAdmin();
  if (!user || !role) return Response.json({ error: "운영자만 선수 정보를 수정할 수 있습니다." }, { status: 403 });
  const body = await request.json() as Record<string, unknown>;
  const teamId = String(body.teamId || ""), playerId = String(body.playerId || "");
  const year = Number(body.year), height = Number(body.height), weight = Number(body.weight);
  const number = String(body.number || "").trim(), grade = String(body.grade || "").trim(), position = String(body.position || "").trim();
  const introduction = String(body.introduction || "").trim(), strengths = String(body.strengths || "").trim(), aspiration = String(body.aspiration || "").trim();
  if (!validTeamId(teamId) || !validPlayerId(playerId)) return Response.json({ error: "선수 또는 학교 정보가 올바르지 않습니다." }, { status: 400 });
  if (!Number.isInteger(year) || year < 2000 || year > 2100 || !Number.isInteger(height) || height < 100 || height > 230 || !Number.isInteger(weight) || weight < 30 || weight > 200) return Response.json({ error: "연도·키·몸무게를 확인해 주세요." }, { status: 400 });
  if (position.length < 1 || position.length > 20 || introduction.length > 500 || strengths.length > 300 || aspiration.length > 300) return Response.json({ error: "입력 글자 수를 확인해 주세요." }, { status: 400 });
  const db = createSupabaseAdminClient();
  const row = { team_id: teamId, player_id: playerId, roster_year: year, jersey_number: number, grade, position, height, weight, introduction, strengths, aspiration, updated_by: user.email };
  const { error } = await db.from("player_profile_overrides").upsert(row, { onConflict: "team_id,player_id" });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ playerId, year, number, grade, position, height, weight, introduction, strengths, aspiration, updatedAt: Date.now() });
}

export async function DELETE(request: Request) {
  const { role } = await apiAdmin();
  if (!role) return Response.json({ error: "운영자만 선수 정보를 수정할 수 있습니다." }, { status: 403 });
  const url = new URL(request.url), teamId = url.searchParams.get("teamId") || "", playerId = url.searchParams.get("playerId") || "";
  if (!validTeamId(teamId) || !validPlayerId(playerId)) return Response.json({ error: "선수 또는 학교 정보가 올바르지 않습니다." }, { status: 400 });
  await createSupabaseAdminClient().from("player_profile_overrides").delete().eq("team_id", teamId).eq("player_id", playerId);
  return new Response(null, { status: 204 });
}
