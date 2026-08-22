import { apiUser, configuredAdminRole } from "../../../api-auth";
import { COMMUNITY_CATEGORIES, communityContentError, identityBadge } from "../../../community-model";
import { createSupabaseAdminClient } from "../../../supabase/admin";

function publicDisplayName(profile: Record<string, unknown>) {
  const displayName = String(profile.display_name || "").trim();
  const emailPrefix = String(profile.email || "").split("@")[0].trim().toLowerCase();
  if (!displayName || (emailPrefix && displayName.toLowerCase() === emailPrefix)) return "아마ON 회원";
  return displayName;
}

export async function GET() {
  const user = await apiUser();
  if (!user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const supabase = createSupabaseAdminClient();
  const [{ data: blocked }, { data: posts, error }] = await Promise.all([
    supabase.from("community_blocks").select("blocked_user_id").eq("user_id", user.id),
    supabase.from("community_posts").select("*").eq("hidden", false).order("created_at", { ascending: false }).limit(100),
  ]);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  const blockedIds = new Set((blocked || []).map((item) => item.blocked_user_id));
  const visible = (posts || []).filter((post) => !blockedIds.has(post.author_id));
  const authorIds = [...new Set(visible.map((post) => post.author_id))];
  const { data: profiles } = authorIds.length ? await supabase.from("member_profiles").select("user_id,display_name,member_role,identity_status,activity_points,email").in("user_id", authorIds) : { data: [] };
  const profileMap = new Map((profiles || []).map((profile) => [profile.user_id, {
    user_id: profile.user_id,
    display_name: publicDisplayName(profile),
    member_role: profile.member_role,
    identity_status: profile.identity_status,
    activity_points: profile.activity_points,
    identity_badge: identityBadge(profile.member_role, profile.identity_status, configuredAdminRole(profile.email)),
  }]));
  return Response.json({ items: visible.map((post) => ({ ...post, author: profileMap.get(post.author_id) || null })), userId: user.id, isAdmin: Boolean(configuredAdminRole(user.email)) });
}

export async function POST(request: Request) {
  const user = await apiUser();
  if (!user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const title = String(body.title || "").trim().slice(0, 80);
  const content = String(body.content || "").trim().slice(0, 2000);
  const categories = new Set(COMMUNITY_CATEGORIES.map(([value]) => value));
  const category = categories.has(body.category) ? body.category : "free";
  if (title.length < 2 || content.length < 2) return Response.json({ error: "제목과 내용을 입력해 주세요." }, { status: 400 });
  const safetyError = communityContentError(title, content);
  if (safetyError) return Response.json({ error: safetyError }, { status: 400 });
  const supabase = createSupabaseAdminClient();
  const { data: profile } = await supabase.from("member_profiles").select("activity_points,suspended_until").eq("user_id", user.id).single();
  if (profile?.suspended_until && new Date(profile.suspended_until) > new Date()) return Response.json({ error: "커뮤니티 이용이 일시 정지된 회원입니다." }, { status: 403 });
  const { data, error } = await supabase.from("community_posts").insert({ author_id: user.id, category, title, content }).select("*").single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  await supabase.from("member_profiles").update({ activity_points: Number(profile?.activity_points || 0) + 10, updated_at: new Date().toISOString() }).eq("user_id", user.id);
  return Response.json({ item: data }, { status: 201 });
}
