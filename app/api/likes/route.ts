import { publicAccess } from "../../public-access";
import { apiUser } from "../../api-auth";
import { createSupabaseAdminClient } from "../../supabase/admin";

function isMediaKey(value: string) {
  return /^((gd|teams)\/[A-Za-z0-9-]+\/(pitching|batting|fielding|photo|profile|banner|emblem)\/[^/]{1,240}|youtube\/[A-Za-z0-9-]+\/(pitching|batting|fielding)\/[A-Za-z0-9_-]{11})$/.test(value);
}

export async function GET() {
  const user = await apiUser();
  const access = await publicAccess();
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from("media_likes").select("media_key, visitor_id");
  if (error) return Response.json({ error: error.message }, { status: 500 });
  const grouped = new Map<string, { count: number; liked: boolean }>();
  for (const row of data || []) {
    if (!access.media(row.media_key)) continue;
    const current = grouped.get(row.media_key) || { count: 0, liked: false };
    current.count += 1;
    if (user && row.visitor_id === user.id) current.liked = true;
    grouped.set(row.media_key, current);
  }
  return Response.json({ items: [...grouped].map(([key, value]) => ({ key, ...value })) }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  const user = await apiUser();
  if (!user) return Response.json({ error: "회원 로그인이 필요합니다." }, { status: 401 });
  const { key = "" } = await request.json() as { key?: string };
  if (!isMediaKey(key)) return Response.json({ error: "올바르지 않은 미디어입니다." }, { status: 400 });
  const db = createSupabaseAdminClient();
  const existing = await db.from("media_likes").select("media_key").eq("media_key", key).eq("visitor_id", user.id).maybeSingle();
  if (existing.error) return Response.json({ error: existing.error.message }, { status: 500 });
  if (existing.data) {
    const { error } = await db.from("media_likes").delete().eq("media_key", key).eq("visitor_id", user.id);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    await db.from("member_notifications").delete().eq("notification_type", "media_like").eq("media_key", key).eq("actor_id", user.id);
  } else {
    const { error } = await db.from("media_likes").insert({ media_key: key, visitor_id: user.id });
    if (error) return Response.json({ error: error.message }, { status: 500 });
    const { data: media } = await db.from("media_items").select("player_id").eq("storage_key", key).maybeSingle();
    const playerId = String(media?.player_id || key.split("/")[1] || "");
    if (playerId) {
      const { data: owners } = await db.from("member_profiles").select("user_id,linked_team_id,linked_player_id").eq("linked_player_id", playerId);
      const rows = (owners || []).filter((owner) => owner.user_id !== user.id).map((owner) => ({
        recipient_id: owner.user_id,
        actor_id: user.id,
        notification_type: "media_like",
        media_key: key,
        team_id: owner.linked_team_id || "",
        player_id: owner.linked_player_id || playerId,
      }));
      if (rows.length) await db.from("member_notifications").insert(rows);
    }
  }
  const { count, error: countError } = await db.from("media_likes").select("*", { count: "exact", head: true }).eq("media_key", key);
  if (countError) return Response.json({ error: countError.message }, { status: 500 });
  return Response.json({ key, count: count || 0, liked: !existing.data });
}
