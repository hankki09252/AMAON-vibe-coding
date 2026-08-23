import { apiUser, configuredAdminRole } from "../../../api-auth";
import { communityContentError } from "../../../community-model";
import { createSupabaseAdminClient } from "../../../supabase/admin";

export async function POST(request: Request) {
  const user = await apiUser();
  if (!user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const postId = String(body.postId || "");
  const content = String(body.content || "").trim().slice(0, 500);
  if (!/^[0-9a-f-]{36}$/i.test(postId) || content.length < 1) return Response.json({ error: "댓글을 입력해 주세요." }, { status: 400 });
  const safetyError = communityContentError("댓글", content);
  if (safetyError) return Response.json({ error: safetyError }, { status: 400 });
  const db = createSupabaseAdminClient();
  const [{ data: profile }, { data: post }] = await Promise.all([
    db.from("member_profiles").select("activity_points,suspended_until").eq("user_id", user.id).single(),
    db.from("community_posts").select("id,author_id,hidden").eq("id", postId).maybeSingle(),
  ]);
  if (!post || post.hidden) return Response.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
  if (profile?.suspended_until && new Date(profile.suspended_until) > new Date()) return Response.json({ error: "커뮤니티 이용이 일시 정지된 회원입니다." }, { status: 403 });
  const { data, error } = await db.from("community_comments").insert({ post_id: postId, author_id: user.id, content }).select("*").single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  await db.from("member_profiles").update({ activity_points: Number(profile?.activity_points || 0) + 2, updated_at: new Date().toISOString() }).eq("user_id", user.id);
  if (post.author_id !== user.id) await db.from("member_notifications").insert({ recipient_id: post.author_id, actor_id: user.id, notification_type: "post_comment", post_id: postId, comment_id: data.id });
  return Response.json({ item: data }, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await apiUser();
  if (!user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id") || "";
  const db = createSupabaseAdminClient();
  const { data } = await db.from("community_comments").select("author_id").eq("id", id).maybeSingle();
  if (!data) return Response.json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 });
  if (data.author_id !== user.id && !configuredAdminRole(user.email)) return Response.json({ error: "삭제 권한이 없습니다." }, { status: 403 });
  const { error } = await db.from("community_comments").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
