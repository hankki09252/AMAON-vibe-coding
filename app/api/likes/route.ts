import { apiUser } from "../../api-auth";
import { createSupabaseAdminClient } from "../../supabase/admin";

function isMediaKey(value: string) {
  return /^((gd|teams)\/[A-Za-z0-9-]+\/(pitching|batting|fielding|photo|profile|banner|emblem)\/[^/]{1,240}|youtube\/[A-Za-z0-9-]+\/(pitching|batting|fielding)\/[A-Za-z0-9_-]{11})$/.test(value);
}

export async function GET() {
  const user = await apiUser();
  if (!user) return Response.json({ error: "회원 로그인이 필요합니다." }, { status: 401 });
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from("media_likes").select("media_key, visitor_id");
  if (error) return Response.json({ error: error.message }, { status: 500 });
  const grouped = new Map<string, { count: number; liked: boolean }>();
  for (const row of data || []) {
    const current = grouped.get(row.media_key) || { count: 0, liked: false };
    current.count += 1;
    if (row.visitor_id === user.id) current.liked = true;
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
  if (existing.data) await db.from("media_likes").delete().eq("media_key", key).eq("visitor_id", user.id);
  else await db.from("media_likes").insert({ media_key: key, visitor_id: user.id });
  const { count } = await db.from("media_likes").select("*", { count: "exact", head: true }).eq("media_key", key);
  return Response.json({ key, count: count || 0, liked: !existing.data });
}
