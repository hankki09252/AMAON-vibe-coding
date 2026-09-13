import { apiAdmin } from "../../../../api-auth";
import { createSupabaseAdminClient } from "../../../../supabase/admin";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/.test(id)) return new Response("Not found", { status: 404 });
  const db = createSupabaseAdminClient();
  const { data: image } = await db.from("weekly_images").select("storage_key,weekly_id").eq("id", id).maybeSingle();
  if (!image) return new Response("Not found", { status: 404 });
  const { data: post } = await db.from("weekly_posts").select("id").eq("id", image.weekly_id).eq("published", true).maybeSingle();
  let storageKey = post ? image.storage_key : "";
  let isPrivate = false;
  if (!storageKey) {
    const { role } = await apiAdmin();
    if (!role) return new Response("Not found", { status: 404 });
    storageKey = image.storage_key;
    isPrivate = true;
  }
  if (!storageKey) return new Response("Not found", { status: 404 });
  const { data: file, error } = await db.storage.from("media").download(storageKey);
  if (error || !file) return new Response("Not found", { status: 404 });
  return new Response(await file.arrayBuffer(), { headers: { "Content-Type": file.type || "image/jpeg", "Cache-Control": isPrivate ? "private, no-store" : "public, max-age=3600, stale-while-revalidate=86400" } });
}
