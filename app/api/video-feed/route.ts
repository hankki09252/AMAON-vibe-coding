import { apiUser } from "../../api-auth";
import { publicAccess } from "../../public-access";
import { createSupabaseAdminClient } from "../../supabase/admin";
import { youtubeEmbedUrl, youtubeThumbnailUrl } from "../../youtube";

const videoCategories = ["pitching", "batting", "fielding"];
const pageSize = 8;

export async function GET(request: Request) {
  const user = await apiUser();
  const db = createSupabaseAdminClient();
  const cursor = new URL(request.url).searchParams.get("cursor");
  let query = db
    .from("media_items")
    .select("storage_key, player_id, category, content_type, uploaded_at")
    .in("category", videoCategories)
    .order("uploaded_at", { ascending: false })
    .limit(48);
  if (cursor) query = query.lt("uploaded_at", cursor);

  const { data: rows, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const access = await publicAccess((rows || []).map((row) => row.player_id));
  const publicRows = (rows || []).filter((row) => access.player(row.player_id));
  const selected = publicRows.slice(0, pageSize);
  const keys = selected.map((row) => row.storage_key);
  const likes = keys.length
    ? await db.from("media_likes").select("media_key, visitor_id").in("media_key", keys)
    : { data: [], error: null };
  if (likes.error) return Response.json({ error: likes.error.message }, { status: 500 });

  const counts = new Map<string, number>();
  const likedKeys = new Set<string>();
  for (const row of likes.data || []) {
    counts.set(row.media_key, (counts.get(row.media_key) || 0) + 1);
    if (user && row.visitor_id === user.id) likedKeys.add(row.media_key);
  }

  const items = await Promise.all(selected.map(async (row) => {
    const youtube = row.storage_key.match(/^youtube\/[A-Za-z0-9-]+\/(pitching|batting|fielding)\/([A-Za-z0-9_-]{11})$/);
    if (youtube) return {
      key: row.storage_key,
      playerId: row.player_id,
      category: row.category,
      uploadedAt: row.uploaded_at,
      likeCount: counts.get(row.storage_key) || 0,
      liked: likedKeys.has(row.storage_key),
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
      uploadedAt: row.uploaded_at,
      likeCount: counts.get(row.storage_key) || 0,
      liked: likedKeys.has(row.storage_key),
      source: "upload",
      url: signed?.signedUrl || "",
      thumbnailUrl: "",
    };
  }));

  const lastSelected = selected.at(-1) || (rows || []).at(-1);
  const hasMore = publicRows.length > selected.length || (rows || []).length === 48;
  return Response.json({
    items,
    nextCursor: hasMore && lastSelected ? lastSelected.uploaded_at : null,
  }, { headers: { "cache-control": "private, no-store" } });
}
