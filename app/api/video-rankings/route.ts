import { apiUser } from "../../api-auth";
import { createSupabaseAdminClient } from "../../supabase/admin";
import { youtubeEmbedUrl, youtubeThumbnailUrl } from "../../youtube";

const videoCategories = ["pitching", "batting", "fielding"];

export async function GET() {
  const user = await apiUser();
  if (!user) return Response.json({ error: "회원 로그인이 필요합니다." }, { status: 401 });

  const db = createSupabaseAdminClient();
  const [{ data: media, error: mediaError }, { data: likeRows, error: likesError }] = await Promise.all([
    db
      .from("media_items")
      .select("storage_key, player_id, category, content_type, uploaded_at")
      .in("category", videoCategories)
      .order("uploaded_at", { ascending: false })
      .limit(1000),
    db.from("media_likes").select("media_key"),
  ]);

  if (mediaError || likesError) {
    return Response.json({ error: mediaError?.message || likesError?.message || "영상 순위를 불러오지 못했습니다." }, { status: 500 });
  }

  const counts = new Map<string, number>();
  for (const row of likeRows || []) counts.set(row.media_key, (counts.get(row.media_key) || 0) + 1);

  const ranked = [...(media || [])]
    .map((row) => ({ ...row, like_count: counts.get(row.storage_key) || 0 }))
    .sort((a, b) => b.like_count - a.like_count || Date.parse(b.uploaded_at) - Date.parse(a.uploaded_at))
    // Return enough candidates for the client to remove currently hidden regions
    // while still presenting an accurate public top five.
    .slice(0, 50);

  const items = await Promise.all(ranked.map(async (row) => {
    const youtube = row.storage_key.match(/^youtube\/[A-Za-z0-9-]+\/(pitching|batting|fielding)\/([A-Za-z0-9_-]{11})$/);
    if (youtube) return {
      key: row.storage_key,
      playerId: row.player_id,
      category: row.category,
      contentType: row.content_type,
      uploadedAt: row.uploaded_at,
      likeCount: row.like_count,
      source: "youtube",
      videoId: youtube[2],
      url: youtubeEmbedUrl(youtube[2]),
      thumbnailUrl: youtubeThumbnailUrl(youtube[2]),
    };
    const { data: signed } = await db.storage.from("media").createSignedUrl(row.storage_key, 3600);
    return {
      key: row.storage_key,
      playerId: row.player_id,
      category: row.category,
      contentType: row.content_type,
      uploadedAt: row.uploaded_at,
      likeCount: row.like_count,
      url: signed?.signedUrl || "",
      source: "upload",
      thumbnailUrl: "",
    };
  }));

  return Response.json({ items }, { headers: { "cache-control": "no-store" } });
}
