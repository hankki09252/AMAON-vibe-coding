import { publicAccess } from "./public-access";
import { apiAdmin, validTeamId } from "./api-auth";
import { createSupabaseAdminClient } from "./supabase/admin";

const signedUrlTtlSeconds = 60 * 60 * 24 * 7;
const assetResponseHeaders = { "cache-control": "private, max-age=60, stale-while-revalidate=300" };

const restoredEmblemTeams = new Set([
  "baekjae-roster",
  "baemyeong-roster",
  "deoksu-roster",
  "gangneung-roster",
  "gd-roster",
  "gyeonggi-roster",
  "gyeongsang-roster",
  "kyungdong-roster",
  "semyeong-roster",
  "seongnam-roster",
  "seoul-auto-roster",
  "seoul-convention-roster",
  "seoul-design-roster",
  "seoul-dongsan-roster",
  "seoul-hg-roster",
  "seoul-hk-roster",
  "seoul-it-roster",
  "seoul-roster",
  "sunrin-roster",
]);

const restoredBannerTeams = new Set([
  "baekjae-roster",
  "baemyeong-roster",
  "deoksu-roster",
  "gd-roster",
  "gyeonggi-roster",
  "gyeongsang-roster",
  "kyungdong-roster",
  "seongnam-roster",
  "seoul-auto-roster",
  "seoul-convention-roster",
  "seoul-design-roster",
  "seoul-dongsan-roster",
  "seoul-hg-roster",
  "seoul-hk-roster",
  "seoul-it-roster",
  "seoul-roster",
  "sunrin-roster",
]);

function restoredAsset(kind: "banner" | "emblem", teamId: string) {
  const exists = kind === "emblem" ? restoredEmblemTeams.has(teamId) : restoredBannerTeams.has(teamId);
  if (!exists) return null;
  return {
    key: `restored/${teamId}/${kind}.png`,
    url: `/team-${kind}s/${teamId}.png`,
    uploadedAt: "2026-08-15T00:00:00.000Z",
  };
}

export function createTeamAssetHandlers(kind: "banner" | "emblem") {
  const maxSize = kind === "banner" ? 4 * 1024 * 1024 : 2 * 1024 * 1024;
  const label = kind === "banner" ? "팀 배너" : "팀 엠블럼";
  const pathPrefix = (teamId: string) => `teams/${teamId}/${kind}/`;

  async function GET(request: Request) {
    const { role } = await apiAdmin();
    const access = role ? null : await publicAccess();
    const searchParams = new URL(request.url).searchParams;
    const teamId = searchParams.get("teamId") || "";
    const teamIds = [...new Set((searchParams.get("teamIds") || "").split(",").filter(Boolean))];
    if (teamIds.length > 60 || teamIds.some((item) => !validTeamId(item))) {
      return Response.json({ error: "학교 정보가 올바르지 않습니다." }, { status: 400 });
    }
    if (!teamIds.length && !validTeamId(teamId)) return Response.json({ error: "학교 정보가 올바르지 않습니다." }, { status: 400 });
    const db = createSupabaseAdminClient();

    async function loadAsset(id: string) {
      if (access && !access.team(id)) return null;
      const { data } = await db.storage.from("media").list(pathPrefix(id), { limit: 20, sortBy: { column: "created_at", order: "desc" } });
      const object = data?.[0];
      if (!object) return restoredAsset(kind, id);
      const key = `${pathPrefix(id)}${object.name}`;
      const { data: signed } = await db.storage.from("media").createSignedUrl(key, signedUrlTtlSeconds);
      return { key, url: signed?.signedUrl || "", uploadedAt: object.created_at };
    }

    if (teamIds.length) {
      const assets = await Promise.all(teamIds.map(async (id) => [id, await loadAsset(id)] as const));
      return Response.json({ items: Object.fromEntries(assets) }, { headers: assetResponseHeaders });
    }

    return Response.json({ [kind]: await loadAsset(teamId) }, { headers: assetResponseHeaders });
  }

  async function POST(request: Request) {
    const { role } = await apiAdmin();
    if (!role) return Response.json({ error: `운영자만 ${label}을 변경할 수 있습니다.` }, { status: 403 });
    const form = await request.formData();
    const teamId = String(form.get("teamId") || "");
    const file = form.get("file");
    if (!validTeamId(teamId) || !(file instanceof File) || !file.type.startsWith("image/")) return Response.json({ error: "이미지 파일을 확인해 주세요." }, { status: 400 });
    if (file.size > maxSize) return Response.json({ error: `${label}은 ${Math.round(maxSize / 1024 / 1024)}MB 이하로 올려 주세요.` }, { status: 413 });
    const extension = (file.name.split(".").pop() || "jpg").replace(/[^a-zA-Z0-9]/g, "").slice(0, 8);
    const key = `${pathPrefix(teamId)}${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const db = createSupabaseAdminClient();
    const previous = await db.storage.from("media").list(pathPrefix(teamId), { limit: 20 });
    if (previous.data?.length) await db.storage.from("media").remove(previous.data.map((item) => `${pathPrefix(teamId)}${item.name}`));
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error } = await db.storage.from("media").upload(key, bytes, { contentType: file.type, cacheControl: "31536000", upsert: true });
    if (error) return Response.json({ error: error.message }, { status: 500 });
    const { data: signed } = await db.storage.from("media").createSignedUrl(key, signedUrlTtlSeconds);
    return Response.json({ ok: true, key, url: signed?.signedUrl || "" }, { status: 201 });
  }

  async function DELETE(request: Request) {
    const { role } = await apiAdmin();
    if (!role) return Response.json({ error: `운영자만 ${label}을 삭제할 수 있습니다.` }, { status: 403 });
    const teamId = new URL(request.url).searchParams.get("teamId") || "";
    if (!validTeamId(teamId)) return Response.json({ error: "학교 정보가 올바르지 않습니다." }, { status: 400 });
    const db = createSupabaseAdminClient();
    const existing = await db.storage.from("media").list(pathPrefix(teamId), { limit: 20 });
    if (existing.data?.length) await db.storage.from("media").remove(existing.data.map((item) => `${pathPrefix(teamId)}${item.name}`));
    return new Response(null, { status: 204 });
  }
  return { GET, POST, DELETE };
}
