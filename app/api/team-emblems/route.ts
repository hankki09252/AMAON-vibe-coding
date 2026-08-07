import { env } from "cloudflare:workers";
import { isAdminRequest, isAuthenticatedRequest } from "../../admin";

const maxEmblemSize = 20 * 1024 * 1024;

type EmblemBucket = {
  list(options: { prefix: string; limit: number; include?: Array<"httpMetadata"> }): Promise<{ objects: Array<{ key: string; uploaded: Date; httpMetadata?: { contentType?: string } }> }>;
  get(key: string): Promise<{ body: ReadableStream; httpMetadata?: { contentType?: string }; size: number; writeHttpMetadata(headers: Headers): void } | null>;
  put(key: string, body: ReadableStream, options: { httpMetadata: { contentType: string } }): Promise<unknown>;
  delete(keys: string | string[]): Promise<void>;
};

function bucket(): EmblemBucket {
  return (env as unknown as { MEDIA: EmblemBucket }).MEDIA;
}

function isAllowedTeamId(teamId: string) {
  return /^[a-z0-9][a-z0-9-]{1,62}-roster$/.test(teamId);
}

function safeExtension(fileName: string) {
  return fileName.includes(".") ? fileName.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8) : "png";
}

function contentTypeFromKey(key: string) {
  const extension = key.split(".").pop()?.toLowerCase();
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  if (extension === "webp") return "image/webp";
  return "image/png";
}

function emblemPrefix(teamId: string) {
  return `teams/${teamId}/emblem/`;
}

export async function GET(request: Request) {
  if (!isAuthenticatedRequest(request)) return Response.json({ error: "회원 로그인 후 이용할 수 있습니다." }, { status: 401 });
  const url = new URL(request.url);
  const key = url.searchParams.get("key");

  if (key) {
    if (!/^teams\/[a-z0-9-]+-roster\/emblem\/[^/]+$/.test(key)) return Response.json({ error: "올바르지 않은 엠블럼 경로입니다." }, { status: 400 });
    const object = await bucket().get(key);
    if (!object) return Response.json({ error: "엠블럼을 찾을 수 없습니다." }, { status: 404 });
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    if (!headers.has("content-type")) headers.set("content-type", contentTypeFromKey(key));
    headers.set("content-length", String(object.size));
    headers.set("cache-control", "public, max-age=3600");
    return new Response(object.body, { headers });
  }

  const teamId = url.searchParams.get("teamId") ?? "";
  if (!isAllowedTeamId(teamId)) return Response.json({ error: "학교 정보가 올바르지 않습니다." }, { status: 400 });
  const result = await bucket().list({ prefix: emblemPrefix(teamId), limit: 20, include: ["httpMetadata"] });
  const emblem = [...result.objects].sort((a, b) => b.uploaded.getTime() - a.uploaded.getTime())[0];
  return Response.json({
    emblem: emblem ? { key: emblem.key, url: `/api/team-emblems?key=${encodeURIComponent(emblem.key)}`, uploadedAt: emblem.uploaded.toISOString() } : null,
  }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) return Response.json({ error: "관리자만 학교 엠블럼을 변경할 수 있습니다." }, { status: 403 });
  const form = await request.formData();
  const teamId = String(form.get("teamId") ?? "");
  const file = form.get("file");
  if (!isAllowedTeamId(teamId)) return Response.json({ error: "학교 정보가 올바르지 않습니다." }, { status: 400 });
  if (!(file instanceof File) || !file.type.startsWith("image/")) return Response.json({ error: "이미지 파일을 선택해 주세요." }, { status: 415 });
  if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(file.type)) return Response.json({ error: "JPG, PNG, WEBP 엠블럼만 올릴 수 있습니다." }, { status: 415 });
  if (file.size > maxEmblemSize) return Response.json({ error: "엠블럼은 20MB 이하만 올릴 수 있습니다." }, { status: 413 });

  const prefix = emblemPrefix(teamId);
  const extension = safeExtension(file.name) || "png";
  const key = `${prefix}${Date.now()}-${crypto.randomUUID()}.${extension}`;
  await bucket().put(key, file.stream(), { httpMetadata: { contentType: file.type } });
  const previous = await bucket().list({ prefix, limit: 20 });
  const oldKeys = previous.objects.map((item) => item.key).filter((itemKey) => itemKey !== key);
  if (oldKeys.length) await bucket().delete(oldKeys);
  return Response.json({ ok: true, key, url: `/api/team-emblems?key=${encodeURIComponent(key)}` }, { status: 201 });
}

export async function DELETE(request: Request) {
  if (!isAdminRequest(request)) return Response.json({ error: "관리자만 학교 엠블럼을 삭제할 수 있습니다." }, { status: 403 });
  const teamId = new URL(request.url).searchParams.get("teamId") ?? "";
  if (!isAllowedTeamId(teamId)) return Response.json({ error: "학교 정보가 올바르지 않습니다." }, { status: 400 });
  const result = await bucket().list({ prefix: emblemPrefix(teamId), limit: 20 });
  const keys = result.objects.map((item) => item.key);
  if (keys.length) await bucket().delete(keys);
  return new Response(null, { status: 204 });
}
