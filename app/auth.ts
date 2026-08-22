import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase/server";

export type AmaonUser = { userId: string; email: string; displayName: string };

export async function getAmaonUser(): Promise<AmaonUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;
  return {
    userId: user.id,
    email: user.email,
    displayName: String(user.user_metadata?.display_name || user.user_metadata?.full_name || "아마ON 회원"),
  };
}

export async function requireAmaonUser(returnTo = "/") {
  const user = await getAmaonUser();
  if (user) return user;
  redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
}

export async function adminRole() {
  const user = await getAmaonUser();
  if (!user) return null;
  const emails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const index = emails.indexOf(user.email.toLowerCase());
  return index < 0 ? null : index === 0 ? "admin" : "assistant";
}
