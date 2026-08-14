import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "./supabase/server";

export async function apiUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export function configuredAdminRole(email?: string | null) {
  if (!email) return null;
  const emails = (process.env.ADMIN_EMAILS || "")
    .split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
  const index = emails.indexOf(email.toLowerCase());
  return index < 0 ? null : index === 0 ? "admin" : "assistant";
}

export async function apiAdmin() {
  const user = await apiUser();
  return { user, role: configuredAdminRole(user?.email) };
}

export function validTeamId(value: string) {
  return /^[a-z0-9][a-z0-9-]{1,62}-roster$/.test(value);
}

export function validPlayerId(value: string) {
  return /^[A-Za-z0-9-]{1,80}$/.test(value);
}
