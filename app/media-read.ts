import { createSupabaseAdminClient } from "./supabase/admin";
import { youtubeEmbedUrl, youtubeThumbnailUrl } from "./youtube";
import type { MediaItem } from "./gd-roster";

type MediaRow = { storage_key: string; player_id: string; category: MediaItem["category"]; content_type: string; uploaded_at: string };

// Call only after checking visibility/authorization. Never sign hidden media.
export async function presentMedia(rows: MediaRow[]): Promise<MediaItem[]> {
  const db = createSupabaseAdminClient();
  return Promise.all(rows.map(async (row) => {
    const match = row.storage_key.match(/^youtube\/[A-Za-z0-9-]+\/(pitching|batting|fielding)\/([A-Za-z0-9_-]{11})$/);
    const common = { key: row.storage_key, playerId: row.player_id, contentType: row.content_type, uploadedAt: row.uploaded_at, category: row.category };
    if (match) return {
      ...common, type: "video", source: "youtube", videoId: match[2],
      url: youtubeEmbedUrl(match[2]), thumbnailUrl: youtubeThumbnailUrl(match[2]),
      orientation: row.content_type.includes("orientation=landscape") ? "landscape" : "portrait",
    };
    const { data } = await db.storage.from("media").createSignedUrl(row.storage_key, 60 * 60 * 24 * 7);
    return { ...common, type: row.category === "photo" || row.category === "profile" ? "image" : "video", source: "upload", url: data?.signedUrl || "", orientation: "landscape" };
  }));
}
