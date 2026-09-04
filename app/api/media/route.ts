import { publicAccess } from "../../public-access";
import { apiAdmin, validPlayerId, validTeamId } from "../../api-auth";
import { createSupabaseAdminClient } from "../../supabase/admin";
import { extractYouTubeVideoId, type VideoOrientation } from "../../youtube";
import { presentMedia } from "../../media-read";

const categories = new Set(["pitching", "batting", "fielding", "photo", "profile"]);
const imageCategories = new Set(["photo", "profile"]);

function validKey(key: string) {
  return /^(gd\/[A-Za-z0-9-]+\/(pitching|batting|fielding|photo|profile)\/[^/]{1,240}|teams\/[A-Za-z0-9-]+\/players\/[A-Za-z0-9-]+\/(pitching|batting|fielding|photo|profile)\/[^/]{1,240}|youtube\/[A-Za-z0-9-]+\/(pitching|batting|fielding)\/[A-Za-z0-9_-]{11})$/.test(key);
}

export async function GET(request: Request) {
  const { role } = await apiAdmin();
  const url = new URL(request.url);
  const playerId = url.searchParams.get("playerId");
  const teamId = url.searchParams.get("teamId");
  const playerIds = [...new Set((url.searchParams.get("playerIds") || "").split(",").filter(Boolean))];
  if (playerId && !validPlayerId(playerId)) return Response.json({ error: "선수 정보가 올바르지 않습니다." }, { status: 400 });
  if (teamId && !validTeamId(teamId)) return Response.json({ error: "학교 정보가 올바르지 않습니다." }, { status: 400 });
  if (playerIds.length > 100 || playerIds.some((id) => !validPlayerId(id))) return Response.json({ error: "선수 정보가 올바르지 않습니다." }, { status: 400 });
  const db = createSupabaseAdminClient();
  let query = db.from("media_items").select("storage_key, player_id, category, content_type, uploaded_at").order("uploaded_at", { ascending: false }).limit(1000);
  const scopedIds = teamId ? [...new Set((playerId ? [playerId] : playerIds).flatMap((id) => [id, `${teamId}--${id}`]))] : (playerId ? [playerId] : playerIds);
  if (scopedIds.length === 1) query = query.eq("player_id", scopedIds[0]);
  else if (scopedIds.length) query = query.in("player_id", scopedIds);
  const [{ data, error }, access] = await Promise.all([
    query, role ? null : publicAccess(scopedIds.length ? scopedIds : undefined),
  ]);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  const items = await presentMedia((data || []).filter((row) => !access || access.player(row.player_id, teamId || undefined)));
  return Response.json({ items: teamId ? items.map((item) => ({ ...item, playerId: item.playerId.includes("--") ? item.playerId.slice(item.playerId.indexOf("--") + 2) : item.playerId })) : items }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  const { user, role } = await apiAdmin();
  if (!user || !role) return Response.json({ error: "운영자만 사진과 영상을 등록할 수 있습니다." }, { status: 403 });
  const body = await request.json() as { key?: string; playerId?: string; category?: string; contentType?: string; sourceType?: string; youtubeUrl?: string; orientation?: VideoOrientation };
  const playerId = body.playerId || "";
  const category = body.category || "";
  const isYoutube = body.sourceType === "youtube";
  const videoId = isYoutube ? extractYouTubeVideoId(body.youtubeUrl || "") : null;
  const orientation: VideoOrientation = body.orientation === "landscape" ? "landscape" : "portrait";
  const key = isYoutube && videoId ? `youtube/${playerId}/${category}/${videoId}` : body.key || "";
  const contentType = isYoutube ? `video/youtube;orientation=${orientation}` : body.contentType || "application/octet-stream";
  const isDirectImage = !isYoutube && imageCategories.has(category) && contentType.startsWith("image/");
  if (!validKey(key) || !validPlayerId(playerId) || !categories.has(category) || (isYoutube ? !videoId || imageCategories.has(category) : !isDirectImage || !key.startsWith(`gd/${playerId}/${category}/`))) {
    return Response.json({ error: "업로드 정보가 올바르지 않습니다." }, { status: 400 });
  }
  const db = createSupabaseAdminClient();
  const { error } = await db.from("media_items").upsert({ storage_key: key, player_id: playerId, category, content_type: contentType, uploaded_by: user.email }, { onConflict: "storage_key" });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true, key }, { status: 201 });
}

export async function DELETE(request: Request) {
  const { role } = await apiAdmin();
  if (!role) return Response.json({ error: "운영자만 사진과 영상을 삭제할 수 있습니다." }, { status: 403 });
  const key = new URL(request.url).searchParams.get("key") || "";
  if (!validKey(key)) return Response.json({ error: "올바르지 않은 파일입니다." }, { status: 400 });
  const db = createSupabaseAdminClient();
  if (!key.startsWith("youtube/")) await db.storage.from("media").remove([key]);
  await db.from("media_likes").delete().eq("media_key", key);
  await db.from("media_items").delete().eq("storage_key", key);
  return new Response(null, { status: 204 });
}
