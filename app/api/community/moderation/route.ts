import { apiAdmin, apiUser } from "../../../api-auth";
import { createSupabaseAdminClient } from "../../../supabase/admin";

export async function POST(request: Request) {
  const user = await apiUser();
  if (!user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const supabase = createSupabaseAdminClient();
  if (body.action === "report") {
    const reason = String(body.reason || "부적절한 게시물").slice(0, 300);
    const { error } = await supabase.from("community_reports").upsert({ reporter_id: user.id, post_id: body.postId, reason }, { onConflict: "reporter_id,post_id" });
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true });
  }
  if (body.action === "block") {
    if (!body.blockedUserId || body.blockedUserId === user.id) return Response.json({ error: "차단할 회원을 확인해 주세요." }, { status: 400 });
    const { error } = await supabase.from("community_blocks").upsert({ user_id: user.id, blocked_user_id: body.blockedUserId }, { onConflict: "user_id,blocked_user_id" });
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true });
  }
  const admin = await apiAdmin();
  if (!admin.role) return Response.json({ error: "운영자 권한이 필요합니다." }, { status: 403 });
  if (body.action === "hide") {
    const { error } = await supabase.from("community_posts").update({ hidden: true, moderated_at: new Date().toISOString(), moderated_by: user.email }).eq("id", body.postId);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true });
  }
  if (body.action === "suspend") {
    const until = new Date(Date.now() + 7 * 86400000).toISOString();
    const { error } = await supabase.from("member_profiles").update({ suspended_until: until }).eq("user_id", body.targetUserId);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true });
  }
  return Response.json({ error: "지원하지 않는 작업입니다." }, { status: 400 });
}
