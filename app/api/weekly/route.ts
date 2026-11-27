import { randomUUID } from "crypto";
import { apiAdmin, validPlayerId, validTeamId } from "../../api-auth";
import { createSupabaseAdminClient } from "../../supabase/admin";
import { blogSlug, blogUrlFromBody } from "../../weekly/weekly-blog-link";

const bucket = "media";
const allowedImages = new Set(["image/jpeg", "image/png", "image/webp"]);
const uuidPattern = /^[a-f0-9-]{36}$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function text(form: FormData, key: string, max: number) {
  return String(form.get(key) || "").replace(/\r\n?/g, "\n").replace(/\0/g, "").trim().slice(0, max);
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
  const title = text(form, "title", 120);
  const body = text(form, "body", 5000);
  const isBlog = body.startsWith("AMAON_BLOG_LINK_V1\n");
  const blogUrl = blogUrlFromBody(body);
  const rawSummary = text(form, "summary", 240);
  const summary = isBlog && rawSummary.length < 10 ? "한끼방패 블로그에서 글 전체를 읽어보세요." : rawSummary;
  const oneIssueTitle = isBlog ? "한끼방패 블로그" : text(form, "oneIssueTitle", 100);
  const onMessage = isBlog ? "블로그에서 원문 읽기" : text(form, "onMessage", 160);
  const teamId = text(form, "teamId", 80);
  const playerId = text(form, "playerId", 80);
  const playerName = text(form, "playerName", 80);
  const schoolName = text(form, "schoolName", 100);
  const position = text(form, "position", 40);
  const published = form.get("published") === "true";
  const cover = form.get("cover");

  if (idInput && !uuidPattern.test(idInput)) return Response.json({ error: "수정할 글을 찾지 못했습니다." }, { status: 400 });
  if (isBlog && !blogUrl) return Response.json({ error: "네이버 블로그 게시물 주소를 확인해 주세요." }, { status: 400 });

  const db = createSupabaseAdminClient();
  const existing = idInput ? await db.from("weekly_posts").select("cover_storage_key,published_at,issue_number,slug,body").eq("id", id).maybeSingle() : { data: null, error: null };
  if (existing.error || (idInput && !existing.data)) return Response.json({ error: "수정할 WEEKLY를 찾지 못했습니다." }, { status: 404 });
  if (isBlog && idInput && !blogUrlFromBody(existing.data?.body || "")) return Response.json({ error: "블로그 글만 이 화면에서 수정할 수 있습니다." }, { status: 400 });

  let issueNumber = Number(form.get("issueNumber"));
  let slug = text(form, "slug", 100);
  if (blogUrl) {
    if (idInput && existing.data) {
      issueNumber = existing.data.issue_number;
      slug = existing.data.slug;
    } else {
      const { data: latest, error: latestError } = await db.from("weekly_posts").select("issue_number").order("issue_number", { ascending: false }).limit(1).maybeSingle();
      if (latestError) return Response.json({ error: "위클리 등록 순서를 확인하지 못했습니다." }, { status: 500 });
      issueNumber = Number(latest?.issue_number || 0) + 1;
      slug = blogSlug(blogUrl);
      const { data: duplicate, error: duplicateError } = await db.from("weekly_posts").select("id,published").eq("slug", slug).maybeSingle();
      if (duplicateError) return Response.json({ error: "같은 블로그 글의 등록 여부를 확인하지 못했습니다." }, { status: 500 });
      if (duplicate) return Response.json({ error: duplicate.published ? "이미 아마온에 등록된 블로그 글입니다." : "이미 임시저장된 블로그 글입니다. 아래 목록에서 수정해 공개하세요.", slug: duplicate.published ? slug : "" }, { status: 409 });
    }
  }

  if (!Number.isInteger(issueNumber) || issueNumber < 1 || issueNumber > 999 || !slugPattern.test(slug)
    || title.length < 2 || summary.length < 10 || oneIssueTitle.length < 2 || body.length < 20 || onMessage.length < 2) {
    return Response.json({ error: isBlog ? "블로그 제목이나 등록 정보를 가져오지 못했습니다. 제목을 확인해 주세요." : "회차, 주소와 원고 필수 항목을 다시 확인해 주세요." }, { status: 400 });
  }
  const hasPlayer = Boolean(teamId || playerId || playerName || schoolName || position);
  if (hasPlayer && (!validTeamId(teamId) || !validPlayerId(playerId) || !playerName || !schoolName)) {
    return Response.json({ error: "소개할 선수를 목록에서 다시 선택해 주세요." }, { status: 400 });
  }
  if (cover instanceof File && cover.size && (!allowedImages.has(cover.type) || cover.size > 4 * 1024 * 1024)) {
    return Response.json({ error: "대표 이미지는 JPG·PNG·WEBP, 최대 4MB까지 가능합니다." }, { status: 400 });
  }

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
    return Response.json({ error: error.code === "23505" ? isBlog ? "이미 등록된 블로그 글이거나 등록 순서가 겹쳤습니다. 다시 눌러 주세요." : "회차 또는 주소가 이미 사용 중입니다." : "WEEKLY를 저장하지 못했습니다." }, { status: 500 });
  }
  if (uploadedKey && existing.data?.cover_storage_key) await db.storage.from(bucket).remove([existing.data.cover_storage_key]);
  return Response.json({ ok: true, id, slug });
}
