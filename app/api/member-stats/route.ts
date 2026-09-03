import { createSupabaseAdminClient } from "../../supabase/admin";

export async function GET() {
  const { count, error } = await createSupabaseAdminClient()
    .from("member_profiles")
    .select("user_id", { count: "exact", head: true });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ totalMembers: count || 0, followerLabel: "아마ON 팔로워" });
}
