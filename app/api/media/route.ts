import { apiAdmin, apiUser, validPlayerId } from "../../api-auth";
import { createSupabaseAdminClient } from "../../supabase/admin";

const categories = new Set(["pitching", "batting", "fielding", "photo", "profile"]);
const imageCategories = new Set(["photo", "profile"]);

function validKey(key: string) {
  return /^gd\/[A-Za-z0-9-]+\/(pitching|batting|fielding|photo|profile)\/[^/]{1,240}$/.test(key);
}

export async function GET(request: Request) {
  const user = await apiUser();
  if (!user) return Response.json({ error: "회원 로그인이 필요합니다." }, { status: 401 });
  const url = new URL(request.url);
  const playerId = url.searchParams.get("playerId");
  if (playerId && !validPlayerId(playerId)) return Response.json({ error: "선수 정보가 올바르지 않습니다." }, { status: 400 });
  const db = createSupabaseAdminClient();
  let query = db.from("media_items").select("storage_key, player_id, category, content_type, uploaded_at").order("uploaded_at", { ascending: false }).limit(1000);
  if (playerId) query = query.eq("player_id", playerId);
  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  const items = await Promise.all((data || []).map(async (row) => {
    const { data: signed } = await db.storage.from("media").createSignedUrl(row.storage_key, 3600);
    return {
      key: row.storage_key,
      playerId: row.player_id,
      type: imageCategories.has(row.category) ? "image" : "video",
      contentType: row.content_type,
      uploadedAt: row.uploaded_at,
      category: row.category,
      url: signed?.signedUrl || "",
    };
  }));
  return Response.json({ items }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  const { user, role } = await apiAdmin();
  if (!user || !role) return Response.json({ error: "운영자만 사진과 영상을 등록할 수 있습니다." }, { status: 403 });
  const body = await request.json() as { key?: string; playerId?: string; category?: string; contentType?: string };
  const key = body.key || "";
  const playerId = body.playerId || "";
  const category = body.category || "";
  const contentType = body.contentType || "application/octet-stream";
  if (!validKey(key) || !validPlayerId(playerId) || !categories.has(category) || !key.startsWith(`gd/${playerId}/${category}/`)) {
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
  await db.storage.from("media").remove([key]);
  await db.from("media_items").delete().eq("storage_key", key);
  return new Response(null, { status: 204 });
}
