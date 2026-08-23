import { apiUser } from "../../api-auth";
import { createSupabaseAdminClient } from "../../supabase/admin";

export async function GET() {
  if (!await apiUser()) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const { count, error } = await createSupabaseAdminClient()
    .from("member_profiles")
    .select("user_id", { count: "exact", head: true });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ totalMembers: count || 0, followerLabel: "아마ON 팔로워" });
}
