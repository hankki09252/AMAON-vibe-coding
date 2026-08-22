import { apiAdmin, apiUser, configuredAdminRole } from "../../api-auth";
import { createSupabaseAdminClient } from "../../supabase/admin";
import { MEMBER_ROLES, activityLevel, identityBadge } from "../../community-model";

async function ensureProfile() {
  const user = await apiUser();
  if (!user) return null;
  const supabase = createSupabaseAdminClient();
  const { data: found } = await supabase.from("member_profiles").select("*").eq("user_id", user.id).maybeSingle();
  if (found) return { user, profile: found };
  const metadata = user.user_metadata || {};
  const role = MEMBER_ROLES.includes(metadata.member_role) ? metadata.member_role : "fan";
  const row = {
    user_id: user.id,
    email: user.email || "",
    display_name: String(metadata.display_name || user.email?.split("@")[0] || "회원").slice(0, 40),
    member_role: role,
    school_name: String(metadata.school_name || "").slice(0, 80),
    related_player_name: String(metadata.related_player_name || "").slice(0, 40),
  };
  const { data, error } = await supabase.from("member_profiles").insert(row).select("*").single();
  if (error) throw error;
  return { user, profile: data };
}

function present(profile: Record<string, unknown>, adminRole?: string | null) {
  const points = Number(profile.activity_points || 0);
  return {
    ...profile,
    identityBadge: identityBadge(String(profile.member_role), String(profile.identity_status), adminRole),
    activityLevel: activityLevel(points),
    isAdmin: Boolean(adminRole),
    adminRole,
  };
}

export async function GET() {
  try {
    const current = await ensureProfile();
    if (!current) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
    const adminRole = configuredAdminRole(current.user.email);
    const result: Record<string, unknown> = { profile: present(current.profile, adminRole) };
    if (adminRole) {
      const supabase = createSupabaseAdminClient();
      const { data } = await supabase.from("member_profiles").select("*").order("created_at", { ascending: false }).limit(500);
      result.members = (data || []).map((item) => present(item, configuredAdminRole(item.email)));
      const today = new Date().toISOString().slice(0, 10);
      const tomorrow = new Date(`${today}T00:00:00.000Z`);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      const [totalResult, verifiedResult, joinedTodayResult, ...roleResults] = await Promise.all([
        supabase.from("member_profiles").select("user_id", { count: "exact", head: true }),
        supabase.from("member_profiles").select("user_id", { count: "exact", head: true }).eq("identity_status", "verified"),
        supabase.from("member_profiles").select("user_id", { count: "exact", head: true }).gte("created_at", `${today}T00:00:00.000Z`).lt("created_at", tomorrow.toISOString()),
        ...MEMBER_ROLES.map((role) => supabase.from("member_profiles").select("user_id", { count: "exact", head: true }).eq("member_role", role)),
      ]);
      const roleCounts = Object.fromEntries(MEMBER_ROLES.map((role, index) => [role, roleResults[index].count || 0]));
      result.stats = {
        total: totalResult.count || 0,
        verified: verifiedResult.count || 0,
        joinedToday: joinedTodayResult.count || 0,
        roleCounts,
      };
    }
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "회원 정보를 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { user, role: adminRole } = await apiAdmin();
  if (!user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const supabase = createSupabaseAdminClient();
  if (body.targetUserId && adminRole) {
    const status = ["pending", "verified", "rejected"].includes(body.identityStatus) ? body.identityStatus : null;
    if (!status) return Response.json({ error: "올바른 인증 상태가 아닙니다." }, { status: 400 });
    const { error } = await supabase.from("member_profiles").update({ identity_status: status, verified_at: status === "verified" ? new Date().toISOString() : null, verified_by: user.email }).eq("user_id", body.targetUserId);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true });
  }
  const displayName = String(body.displayName || "").trim().slice(0, 40);
  const schoolName = String(body.schoolName || "").trim().slice(0, 80);
  if (!displayName) return Response.json({ error: "표시 이름을 입력해 주세요." }, { status: 400 });
  const { error } = await supabase.from("member_profiles").update({ display_name: displayName, school_name: schoolName, updated_at: new Date().toISOString() }).eq("user_id", user.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

