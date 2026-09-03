import { publicAccess } from "../../public-access";
import { apiAdmin, validPlayerId } from "../../api-auth";
import { createSupabaseAdminClient } from "../../supabase/admin";
import { extractYouTubeVideoId, youtubeEmbedUrl, youtubeThumbnailUrl, type VideoOrientation } from "../../youtube";

const categories = new Set(["pitching", "batting", "fielding", "photo", "profile"]);
const imageCategories = new Set(["photo", "profile"]);
const signedUrlTtlSeconds = 60 * 60 * 24 * 7;

function validKey(key: string) {
  return /^(gd\/[A-Za-z0-9-]+\/(pitching|batting|fielding|photo|profile)\/[^/]{1,240}|youtube\/[A-Za-z0-9-]+\/(pitching|batting|fielding)\/[A-Za-z0-9_-]{11})$/.test(key);
}

function youtubeInfo(key: string, contentType: string) {
  const match = key.match(/^youtube\/[A-Za-z0-9-]+\/(pitching|batting|fielding)\/([A-Za-z0-9_-]{11})$/);
  if (!match) return null;
  const orientation: VideoOrientation = contentType.includes("orientation=landscape") ? "landscape" : "portrait";
  return { videoId: match[2], orientation };
}

export async function GET(request: Request) {
  const { role } = await apiAdmin();
  const url = new URL(request.url);
  const playerId = url.searchParams.get("playerId");
  const playerIds = [...new Set((url.searchParams.get("playerIds") || "").split(",").filter(Boolean))];
  if (playerId && !validPlayerId(playerId)) return Response.json({ error: "선수 정보가 올바르지 않습니다." }, { status: 400 });
  if (playerIds.length > 100 || playerIds.some((id) => !validPlayerId(id))) return Response.json({ error: "선수 정보가 올바르지 않습니다." }, { status: 400 });
  const db = createSupabaseAdminClient();
  let query = db.from("media_items").select("storage_key, player_id, category, content_type, uploaded_at").order("uploaded_at", { ascending: false }).limit(1000);
  if (playerId) query = query.eq("player_id", playerId);
  else if (playerIds.length) query = query.in("player_id", playerIds);
  const [{ data, error }, access] = await Promise.all([
    query, role ? null : publicAccess(playerId ? [playerId] : playerIds.length ? playerIds : undefined),
  ]);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  const items = await Promise.all((data || []).filter((row) => !access || access.player(row.player_id)).map(async (row) => {
    const youtube = youtubeInfo(row.storage_key, row.content_type);
    if (youtube) return {
      key: row.storage_key,
      playerId: row.player_id,
      type: "video" as const,
      source: "youtube" as const,
      contentType: row.content_type,
      uploadedAt: row.uploaded_at,
      category: row.category,
      url: youtubeEmbedUrl(youtube.videoId),
      thumbnailUrl: youtubeThumbnailUrl(youtube.videoId),
      videoId: youtube.videoId,
      orientation: youtube.orientation,
    };
    const { data: signed } = await db.storage.from("media").createSignedUrl(row.storage_key, signedUrlTtlSeconds);
    return {
      key: row.storage_key,
      playerId: row.player_id,
      type: imageCategories.has(row.category) ? "image" : "video",
      contentType: row.content_type,
      uploadedAt: row.uploaded_at,
      category: row.category,
      url: signed?.signedUrl || "",
      source: "upload" as const,
      orientation: "landscape" as const,
    };
  }));
  return Response.json({ items }, { headers: { "cache-control": "no-store" } });
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
