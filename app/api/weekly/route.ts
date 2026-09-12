import { randomUUID } from "crypto";
import { apiAdmin, validPlayerId, validTeamId } from "../../api-auth";
import { createSupabaseAdminClient } from "../../supabase/admin";

const bucket = "media";
const allowedImages = new Set(["image/jpeg", "image/png", "image/webp"]);
const uuidPattern = /^[a-f0-9-]{36}$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function text(form: FormData, key: string, max: number) {
  return String(form.get(key) || "").replace(/\0/g, "").trim().slice(0, max);
}

function extension(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

export async function GET() {
  const { role } = await apiAdmin();
  if (!role) return Response.json({ error: "운영자 권한이 필요합니다." }, { status: 403 });
  const { data, error } = await createSupabaseAdminClient().from("weekly_posts").select("*").order("issue_number", { ascending: false });
  if (error) return Response.json({ error: "WEEKLY 목록을 불러오지 못했습니다." }, { status: 500 });
  return Response.json({ items: (data || []).map((row) => ({ ...row, coverUrl: row.cover_storage_key ? `/api/weekly/cover/${row.id}` : "" })) }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  const { user, role } = await apiAdmin();
  if (!user || !role) return Response.json({ error: "운영자 권한이 필요합니다." }, { status: 403 });
  const form = await request.formData().catch(() => null);
  if (!form) return Response.json({ error: "입력 정보를 확인해 주세요." }, { status: 400 });

  const idInput = text(form, "id", 40);
  const id = idInput || randomUUID();
  const issueNumber = Number(form.get("issueNumber"));
  const slug = text(form, "slug", 100);
  const title = text(form, "title", 120);
  const summary = text(form, "summary", 240);
  const oneIssueTitle = text(form, "oneIssueTitle", 100);
  const body = text(form, "body", 5000);
  const onMessage = text(form, "onMessage", 160);
  const teamId = text(form, "teamId", 80);
  const playerId = text(form, "playerId", 80);
  const playerName = text(form, "playerName", 80);
  const schoolName = text(form, "schoolName", 100);
  const position = text(form, "position", 40);
  const published = form.get("published") === "true";
  const cover = form.get("cover");

  if ((idInput && !uuidPattern.test(idInput)) || !Number.isInteger(issueNumber) || issueNumber < 1 || issueNumber > 999 || !slugPattern.test(slug)
    || title.length < 2 || summary.length < 10 || oneIssueTitle.length < 2 || body.length < 20 || onMessage.length < 2) {
    return Response.json({ error: "회차, 주소와 원고 필수 항목을 다시 확인해 주세요." }, { status: 400 });
  }
  const hasPlayer = Boolean(teamId || playerId || playerName || schoolName || position);
  if (hasPlayer && (!validTeamId(teamId) || !validPlayerId(playerId) || !playerName || !schoolName)) {
    return Response.json({ error: "소개할 선수를 목록에서 다시 선택해 주세요." }, { status: 400 });
  }
  if (cover instanceof File && cover.size && (!allowedImages.has(cover.type) || cover.size > 4 * 1024 * 1024)) {
    return Response.json({ error: "대표 이미지는 JPG·PNG·WEBP, 최대 4MB까지 가능합니다." }, { status: 400 });
  }

  const db = createSupabaseAdminClient();
  const existing = idInput ? await db.from("weekly_posts").select("cover_storage_key,published_at").eq("id", id).maybeSingle() : { data: null, error: null };
  if (existing.error) return Response.json({ error: "수정할 WEEKLY를 찾지 못했습니다." }, { status: 404 });
  let coverKey = existing.data?.cover_storage_key || "";
  let uploadedKey = "";
  if (cover instanceof File && cover.size) {
    uploadedKey = `weekly/${id}/cover/${Date.now()}-${randomUUID()}.${extension(cover)}`;
    const { error } = await db.storage.from(bucket).upload(uploadedKey, await cover.arrayBuffer(), { contentType: cover.type, cacheControl: "3600", upsert: false });
    if (error) return Response.json({ error: "대표 이미지를 저장하지 못했습니다." }, { status: 500 });
    coverKey = uploadedKey;
  }
  const now = new Date().toISOString();
  const row = {
    id, issue_number: issueNumber, slug, title, summary, one_issue_title: oneIssueTitle, body, on_message: onMessage,
    cover_storage_key: coverKey || null, team_id: teamId || null, player_id: playerId || null, player_name: playerName || null,
    school_name: schoolName || null, position: position || null, published,
    published_at: published ? existing.data?.published_at || now : null, updated_at: now, created_by: user.email || "admin",
  };
  const { error } = idInput
    ? await db.from("weekly_posts").update(row).eq("id", id)
    : await db.from("weekly_posts").insert(row);
  if (error) {
    if (uploadedKey) await db.storage.from(bucket).remove([uploadedKey]);
    return Response.json({ error: error.code === "23505" ? "회차 또는 주소가 이미 사용 중입니다." : "WEEKLY를 저장하지 못했습니다." }, { status: 500 });
  }
  if (uploadedKey && existing.data?.cover_storage_key) await db.storage.from(bucket).remove([existing.data.cover_storage_key]);
  return Response.json({ ok: true, id });
}
