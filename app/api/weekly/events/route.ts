import { apiAdmin } from "../../../api-auth";
import { createSupabaseAdminClient } from "../../../supabase/admin";

const eventTypes = new Set(["player_profile", "player_video", "profile_submission"]);
const uuidPattern = /^[a-f0-9-]{36}$/;

function koreaDate() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const weeklyId = String(body.weeklyId || "");
  const eventType = String(body.eventType || "");
  if (!uuidPattern.test(weeklyId) || !eventTypes.has(eventType)) return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
  const db = createSupabaseAdminClient();
  const { data: post } = await db.from("weekly_posts").select("id").eq("id", weeklyId).eq("published", true).maybeSingle();
  if (!post) return Response.json({ error: "공개된 WEEKLY를 찾지 못했습니다." }, { status: 404 });
  const { error } = await db.rpc("record_weekly_click", { p_event_date: koreaDate(), p_weekly_id: weeklyId, p_event_type: eventType });
  if (error) return Response.json({ error: "클릭을 기록하지 못했습니다." }, { status: 500 });
  return Response.json({ ok: true });
}

export async function GET() {
  const { role } = await apiAdmin();
  if (!role) return Response.json({ error: "운영자 권한이 필요합니다." }, { status: 403 });
  const db = createSupabaseAdminClient();
  const [posts, clicks, views] = await Promise.all([
    db.from("weekly_posts").select("id,slug"),
    db.from("weekly_clicks_daily").select("weekly_id,event_type,clicks"),
    db.from("site_pageviews_daily").select("page_path,page_views").like("page_path", "/weekly/%"),
  ]);
  const error = posts.error || clicks.error || views.error;
  if (error) return Response.json({ error: "WEEKLY 통계를 불러오지 못했습니다." }, { status: 500 });
  const stats: Record<string, { pageViews: number; playerProfile: number; playerVideo: number; profileSubmission: number }> = {};
  const bySlug = new Map<string, string>();
  for (const post of posts.data || []) { stats[post.id] = { pageViews: 0, playerProfile: 0, playerVideo: 0, profileSubmission: 0 }; bySlug.set(post.slug, post.id); }
  for (const row of clicks.data || []) {
    const item = stats[row.weekly_id]; if (!item) continue;
    const value = Number(row.clicks || 0);
    if (row.event_type === "player_profile") item.playerProfile += value;
    if (row.event_type === "player_video") item.playerVideo += value;
    if (row.event_type === "profile_submission") item.profileSubmission += value;
  }
  for (const row of views.data || []) {
    const slug = String(row.page_path).replace(/^\/weekly\//, "").split(/[?#]/)[0];
    const id = bySlug.get(slug); if (id) stats[id].pageViews += Number(row.page_views || 0);
  }
  return Response.json({ stats }, { headers: { "Cache-Control": "private, no-store" } });
}
