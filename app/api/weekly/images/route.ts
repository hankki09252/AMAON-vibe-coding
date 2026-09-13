import { randomUUID } from "crypto";
import { apiAdmin } from "../../../api-auth";
import { createSupabaseAdminClient } from "../../../supabase/admin";

const uuidPattern = /^[a-f0-9-]{36}$/;
const allowedImages = new Set(["image/jpeg", "image/png", "image/webp"]);

function extension(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

function cleanCaption(value: unknown) {
  return String(value || "").replace(/[\r\n\0]+/g, " ").trim().slice(0, 160);
}

export async function GET(request: Request) {
  const { role } = await apiAdmin();
  if (!role) return Response.json({ error: "운영자 권한이 필요합니다." }, { status: 403 });
  const weeklyId = new URL(request.url).searchParams.get("weeklyId") || "";
  if (!uuidPattern.test(weeklyId)) return Response.json({ error: "WEEKLY 정보가 올바르지 않습니다." }, { status: 400 });
  const { data, error } = await createSupabaseAdminClient().from("weekly_images").select("id,weekly_id,storage_key,caption,after_paragraph,sort_order").eq("weekly_id", weeklyId).order("sort_order");
  if (error) return Response.json({ error: "본문 사진을 불러오지 못했습니다." }, { status: 500 });
  return Response.json({ items: (data || []).map((row) => ({ ...row, imageUrl: `/api/weekly/image/${row.id}` })) }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  const { role } = await apiAdmin();
  if (!role) return Response.json({ error: "운영자 권한이 필요합니다." }, { status: 403 });
  const form = await request.formData().catch(() => null);
  if (!form) return Response.json({ error: "사진 정보를 확인해 주세요." }, { status: 400 });
  const weeklyId = String(form.get("weeklyId") || "");
  const file = form.get("file");
  const caption = cleanCaption(form.get("caption"));
  const afterParagraph = Number(form.get("afterParagraph"));
  if (!uuidPattern.test(weeklyId) || !(file instanceof File) || !file.size || !allowedImages.has(file.type) || file.size > 4 * 1024 * 1024
    || !Number.isInteger(afterParagraph) || afterParagraph < 0 || afterParagraph > 100) {
    return Response.json({ error: "사진은 JPG·PNG·WEBP, 장당 최대 4MB까지 등록할 수 있습니다." }, { status: 400 });
  }
  const db = createSupabaseAdminClient();
  const [{ data: post }, { data: current, error: listError }] = await Promise.all([
    db.from("weekly_posts").select("id").eq("id", weeklyId).maybeSingle(),
    db.from("weekly_images").select("sort_order").eq("weekly_id", weeklyId).order("sort_order"),
  ]);
  if (!post) return Response.json({ error: "먼저 WEEKLY 글을 저장해 주세요." }, { status: 404 });
  if (listError) return Response.json({ error: "본문 사진 수를 확인하지 못했습니다." }, { status: 500 });
  const used = new Set((current || []).map((row) => Number(row.sort_order)));
  const sortOrder = Array.from({ length: 8 }, (_, index) => index).find((index) => !used.has(index));
  if (sortOrder === undefined) return Response.json({ error: "본문 사진은 최대 8장까지 등록할 수 있습니다." }, { status: 409 });
  const id = randomUUID();
  const storageKey = `weekly/${weeklyId}/body/${id}.${extension(file.type)}`;
  const { error: uploadError } = await db.storage.from("media").upload(storageKey, await file.arrayBuffer(), { contentType: file.type, cacheControl: "3600", upsert: false });
  if (uploadError) return Response.json({ error: "본문 사진을 저장하지 못했습니다." }, { status: 500 });
  const { error } = await db.from("weekly_images").insert({ id, weekly_id: weeklyId, storage_key: storageKey, caption, after_paragraph: afterParagraph, sort_order: sortOrder });
  if (error) {
    await db.storage.from("media").remove([storageKey]);
    return Response.json({ error: "본문 사진을 글에 연결하지 못했습니다." }, { status: 500 });
  }
  return Response.json({ ok: true, id }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { role } = await apiAdmin();
  if (!role) return Response.json({ error: "운영자 권한이 필요합니다." }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "");
  const afterParagraph = Number(body.afterParagraph);
  if (!uuidPattern.test(id) || !Number.isInteger(afterParagraph) || afterParagraph < 0 || afterParagraph > 100) return Response.json({ error: "사진 위치가 올바르지 않습니다." }, { status: 400 });
  const { error } = await createSupabaseAdminClient().from("weekly_images").update({ after_paragraph: afterParagraph, caption: cleanCaption(body.caption) }).eq("id", id);
  if (error) return Response.json({ error: "사진 위치를 저장하지 못했습니다." }, { status: 500 });
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const { role } = await apiAdmin();
  if (!role) return Response.json({ error: "운영자 권한이 필요합니다." }, { status: 403 });
  const id = new URL(request.url).searchParams.get("id") || "";
  if (!uuidPattern.test(id)) return Response.json({ error: "사진 정보가 올바르지 않습니다." }, { status: 400 });
  const db = createSupabaseAdminClient();
  const { data } = await db.from("weekly_images").select("storage_key").eq("id", id).maybeSingle();
  if (!data?.storage_key) return Response.json({ error: "사진을 찾지 못했습니다." }, { status: 404 });
  const { error } = await db.from("weekly_images").delete().eq("id", id);
  if (error) return Response.json({ error: "사진 정보를 삭제하지 못했습니다." }, { status: 500 });
  await db.storage.from("media").remove([data.storage_key]);
  return Response.json({ ok: true });
}
