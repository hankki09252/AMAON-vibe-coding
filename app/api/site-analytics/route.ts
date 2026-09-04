import { createHash, randomUUID } from "crypto";
import { cookies } from "next/headers";
import { apiAdmin } from "../../api-auth";
import { createSupabaseAdminClient } from "../../supabase/admin";

const VISITOR_COOKIE = "amaon_visitor";

function koreaDate() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const page = String(body.page || "/#top").trim().slice(0, 160);
  if (!page.startsWith("/")) return Response.json({ error: "잘못된 페이지입니다." }, { status: 400 });

  const cookieStore = await cookies();
  let visitorId = cookieStore.get(VISITOR_COOKIE)?.value;
  if (!visitorId || !/^[a-f0-9-]{36}$/.test(visitorId)) visitorId = randomUUID();
  const visitorHash = createHash("sha256").update(visitorId).digest("hex");
  const { error } = await createSupabaseAdminClient().rpc("record_site_visit", {
    p_visit_date: koreaDate(),
    p_page_path: page,
    p_visitor_hash: visitorHash,
  });
  if (error) return Response.json({ error: "방문 기록을 저장하지 못했습니다." }, { status: 500 });

  const response = Response.json({ ok: true });
  response.headers.append("Set-Cookie", `${VISITOR_COOKIE}=${visitorId}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function GET() {
  const { role } = await apiAdmin();
  if (!role) return Response.json({ error: "운영자 권한이 필요합니다." }, { status: 403 });

  const today = koreaDate();
  const supabase = createSupabaseAdminClient();
  const [totalVisitors, todayVisitors, allViews, todayViews] = await Promise.all([
    supabase.from("site_visitors").select("visitor_hash", { count: "exact", head: true }),
    supabase.from("site_daily_visitors").select("visitor_hash", { count: "exact", head: true }).eq("visit_date", today),
    supabase.from("site_pageviews_daily").select("page_views"),
    supabase.from("site_pageviews_daily").select("page_views").eq("view_date", today),
  ]);
  const error = totalVisitors.error || todayVisitors.error || allViews.error || todayViews.error;
  if (error) return Response.json({ error: "방문 통계를 불러오지 못했습니다." }, { status: 500 });

  const sum = (rows: Array<{ page_views: number | string }> | null) =>
    (rows || []).reduce((total, row) => total + Number(row.page_views || 0), 0);

  return Response.json({
    totalVisitors: totalVisitors.count || 0,
    totalPageViews: sum(allViews.data),
    todayVisitors: todayVisitors.count || 0,
    todayPageViews: sum(todayViews.data),
  }, { headers: { "Cache-Control": "private, no-store" } });
}
