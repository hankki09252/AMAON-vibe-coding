import { validPlayerId, validTeamId } from "../../api-auth";
import { publicAccess } from "../../public-access";
import { createSupabaseAdminClient } from "../../supabase/admin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const teamId = url.searchParams.get("teamId") || "";
  const playerId = url.searchParams.get("playerId") || "";
  if (!validTeamId(teamId) || !validPlayerId(playerId)) {
    return Response.json({ error: "선수 정보가 올바르지 않습니다." }, { status: 400 });
  }
  try {
    const access = await publicAccess([playerId]);
    if (!access.player(playerId, teamId)) return Response.json({ error: "공개 선수를 찾지 못했습니다." }, { status: 404 });
    const db = createSupabaseAdminClient();
    const { data, error } = await db.from("player_profile_submissions")
      .select("profile_data").eq("team_id", teamId).eq("player_id", playerId)
      .eq("submission_type", "profile").eq("status", "approved")
      .contains("profile_data", { featuredVideoRequest: "select-existing" })
      .order("reviewed_at", { ascending: false }).limit(1).maybeSingle();
    if (error) return Response.json({ error: "대표 영상을 불러오지 못했습니다." }, { status: 500 });
    const key = typeof data?.profile_data?.featuredVideoKey === "string" ? data.profile_data.featuredVideoKey : null;
    return Response.json({ key }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "대표 영상을 확인하지 못했습니다." }, { status: 500 });
  }
}
