import { env } from "cloudflare:workers";

const allowedPlayerIds = new Set(["1", "2", "5", "7", "9", "10", "11", "12", "13", "16", "17", "18", "19", "21", "23", "25", "28", "32", "36", "40"]);
const maxFileSize = 100 * 1024 * 1024;

type MediaBucket = {
  list(options: { prefix: string; limit: number }): Promise<{ objects: Array<{ key: string; uploaded: Date; httpMetadata?: { contentType?: string }; customMetadata?: Record<string, string> }> }>;
  get(key: string): Promise<{ body: ReadableStream; httpMetadata?: { contentType?: string }; size: number; writeHttpMetadata(headers: Headers): void } | null>;
  put(key: string, body: ReadableStream, options: { httpMetadata: { contentType: string }; customMetadata: Record<string, string> }): Promise<unknown>;
};

function bucket(): MediaBucket {
  return (env as unknown as { MEDIA: MediaBucket }).MEDIA;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");

  if (key) {
    if (!key.startsWith("gd/")) return Response.json({ error: "잘못된 파일 경로입니다." }, { status: 400 });
    const object = await bucket().get(key);
    if (!object) return Response.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("cache-control", "public, max-age=3600");
    headers.set("content-length", String(object.size));
    return new Response(object.body, { headers });
  }

  const playerId = url.searchParams.get("playerId");
  if (playerId && !allowedPlayerIds.has(playerId)) return Response.json({ error: "선수 정보가 올바르지 않습니다." }, { status: 400 });
  const result = await bucket().list({ prefix: playerId ? `gd/${playerId}/` : "gd/", limit: 1000 });
  const items = result.objects.map((object) => {
    const contentType = object.httpMetadata?.contentType ?? object.customMetadata?.contentType ?? "application/octet-stream";
    return {
      key: object.key,
      playerId: object.customMetadata?.playerId ?? object.key.split("/")[1],
      type: contentType.startsWith("video/") ? "video" : "image",
      contentType,
      uploadedAt: object.uploaded.toISOString(),
      url: `/api/media?key=${encodeURIComponent(object.key)}`,
    };
  });
  return Response.json({ items }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  const form = await request.formData();
  const playerId = String(form.get("playerId") ?? "");
  const file = form.get("file");
  if (!allowedPlayerIds.has(playerId)) return Response.json({ error: "선수 정보가 올바르지 않습니다." }, { status: 400 });
  if (!(file instanceof File)) return Response.json({ error: "업로드할 파일을 선택해 주세요." }, { status: 400 });
  if (!(file.type.startsWith("image/") || file.type.startsWith("video/"))) return Response.json({ error: "사진 또는 영상 파일만 올릴 수 있습니다." }, { status: 415 });
  if (file.size > maxFileSize) return Response.json({ error: "파일은 100MB 이하만 올릴 수 있습니다." }, { status: 413 });

  const extension = file.name.includes(".") ? file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8) : "bin";
  const key = `gd/${playerId}/${Date.now()}-${crypto.randomUUID()}.${extension || "bin"}`;
  await bucket().put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
    customMetadata: { playerId, contentType: file.type },
  });
  return Response.json({ ok: true, key }, { status: 201 });
}
