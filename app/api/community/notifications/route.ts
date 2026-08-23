import { apiUser } from "../../../api-auth";
import { createSupabaseAdminClient } from "../../../supabase/admin";

function publicName(profile: { display_name?: string | null; email?: string | null } | undefined) {
  const name = String(profile?.display_name || "").trim();
  const emailName = String(profile?.email || "").split("@")[0].toLowerCase();
  return !name || name.toLowerCase() === emailName ? "아마ON 회원" : name;
}

export async function GET() {
  const user = await apiUser();
  if (!user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from("member_notifications").select("id,actor_id,notification_type,post_id,media_key,team_id,player_id,read_at,created_at").eq("recipient_id", user.id).order("created_at", { ascending: false }).limit(40);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  const actorIds = [...new Set((data || []).map((item) => item.actor_id))];
  const { data: actors } = actorIds.length ? await db.from("member_profiles").select("user_id,display_name,email").in("user_id", actorIds) : { data: [] };
  const actorMap = new Map((actors || []).map((actor) => [actor.user_id, publicName(actor)]));
  return Response.json({ items: (data || []).map((item) => ({ ...item, actorName: actorMap.get(item.actor_id) || "아마ON 회원" })) }, { headers: { "cache-control": "no-store" } });
}

export async function PATCH(request: Request) {
  const user = await apiUser();
  if (!user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const db = createSupabaseAdminClient();
  let query = db.from("member_notifications").update({ read_at: new Date().toISOString() }).eq("recipient_id", user.id).is("read_at", null);
  if (body.id) query = query.eq("id", String(body.id));
  const { error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
