import { apiAdmin } from "../../../../api-auth";
import { createSupabaseAdminClient } from "../../../../supabase/admin";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/.test(id)) return new Response("Not found", { status: 404 });
  const db = createSupabaseAdminClient();
  const publicPost = await db.from("weekly_posts").select("cover_storage_key").eq("id", id).eq("published", true).maybeSingle();
  let data = publicPost.data;
  let isPrivate = false;
  if (!data) {
    const { role } = await apiAdmin();
    if (!role) return new Response("Not found", { status: 404 });
    data = (await db.from("weekly_posts").select("cover_storage_key").eq("id", id).maybeSingle()).data;
    isPrivate = true;
  }
  if (!data?.cover_storage_key) return new Response("Not found", { status: 404 });
  const { data: file, error } = await db.storage.from("media").download(data.cover_storage_key);
  if (error || !file) return new Response("Not found", { status: 404 });
  return new Response(await file.arrayBuffer(), {
    headers: { "Content-Type": file.type || "image/jpeg", "Cache-Control": isPrivate ? "private, no-store" : "public, max-age=3600, stale-while-revalidate=86400" },
  });
}
