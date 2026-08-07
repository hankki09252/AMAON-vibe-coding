import { env } from "cloudflare:workers";

const allowedPlayerIds = new Set(["1", "2", "5", "7", "9", "10", "11", "12", "13", "16", "17", "18", "19", "21", "23", "25", "28", "32", "36", "40"]);
const allowedGyeonggiPlayerIds = new Set(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "54", "55", "57", "59", "60", "61", "65", "69", "seogwangeun"].map((id) => `gg-${id}`));
const allowedGyeongsangPlayerIds = new Set(["1", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "29", "30", "31", "32", "33", "35", "36", "37", "38", "41", "42", "43", "44", "45", "46", "47", "49", "50", "51", "52", "54", "55", "56", "61", "gujunmo", "seokjunho", "antaeuk"].map((id) => `gs-${id}`));
const allowedKyungdongPlayerIds = new Set(["1", "2", "3", "4", "6", "7", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "44", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "61", "63", "hongjiwoo"].map((id) => `kd-${id}`));
const maxFileSize = 100 * 1024 * 1024;
const maxVideoSize = 2 * 1024 * 1024 * 1024;
const maxPartSize = 60 * 1024 * 1024;
const allowedCategories = new Set(["pitching", "batting", "fielding", "photo"]);

type UploadedPart = { partNumber: number; etag: string };
type MultipartUpload = {
  key: string;
  uploadId: string;
  uploadPart(partNumber: number, body: ReadableStream): Promise<UploadedPart>;
  complete(parts: UploadedPart[]): Promise<{ httpEtag: string }>;
  abort(): Promise<void>;
};

type MediaBucket = {
  list(options: { prefix: string; limit: number }): Promise<{ objects: Array<{ key: string; uploaded: Date; httpMetadata?: { contentType?: string }; customMetadata?: Record<string, string> }> }>;
  get(key: string): Promise<{ body: ReadableStream; httpMetadata?: { contentType?: string }; size: number; writeHttpMetadata(headers: Headers): void } | null>;
  put(key: string, body: ReadableStream, options: { httpMetadata: { contentType: string }; customMetadata: Record<string, string> }): Promise<unknown>;
  createMultipartUpload(key: string, options: { httpMetadata: { contentType: string }; customMetadata: Record<string, string> }): Promise<MultipartUpload>;
  resumeMultipartUpload(key: string, uploadId: string): MultipartUpload;
};

function bucket(): MediaBucket {
  return (env as unknown as { MEDIA: MediaBucket }).MEDIA;
}

function isAllowedPlayerId(playerId: string) {
  return allowedPlayerIds.has(playerId) || allowedGyeonggiPlayerIds.has(playerId) || allowedGyeongsangPlayerIds.has(playerId) || allowedKyungdongPlayerIds.has(playerId);
}

function isAllowedMediaKey(key: string) {
  const [root, playerId, category, fileName] = key.split("/");
  return root === "gd" && isAllowedPlayerId(playerId ?? "") && allowedCategories.has(category ?? "") && Boolean(fileName);
}

function safeExtension(fileName: string) {
  return fileName.includes(".") ? fileName.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8) : "bin";
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
  if (playerId && !isAllowedPlayerId(playerId)) return Response.json({ error: "선수 정보가 올바르지 않습니다." }, { status: 400 });
  const result = await bucket().list({ prefix: playerId ? `gd/${playerId}/` : "gd/", limit: 1000 });
  const items = result.objects.map((object) => {
    const contentType = object.httpMetadata?.contentType ?? object.customMetadata?.contentType ?? "application/octet-stream";
    return {
      key: object.key,
      playerId: object.customMetadata?.playerId ?? object.key.split("/")[1],
      type: contentType.startsWith("video/") ? "video" : "image",
      contentType,
      uploadedAt: object.uploaded.toISOString(),
      category: object.customMetadata?.category ?? (contentType.startsWith("image/") ? "photo" : "pitching"),
      url: `/api/media?key=${encodeURIComponent(object.key)}`,
    };
  });
  return Response.json({ items }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  if (action === "multipart-create") {
    const body = await request.json() as { playerId?: string; category?: string; fileName?: string; contentType?: string; size?: number };
    const playerId = body.playerId ?? "";
    const category = body.category ?? "";
    const contentType = body.contentType ?? "";
    const size = Number(body.size ?? 0);
    if (!isAllowedPlayerId(playerId)) return Response.json({ error: "선수 정보가 올바르지 않습니다." }, { status: 400 });
    if (!allowedCategories.has(category) || category === "photo") return Response.json({ error: "영상 카테고리를 선택해 주세요." }, { status: 400 });
    if (!contentType.startsWith("video/")) return Response.json({ error: "영상 파일만 올릴 수 있습니다." }, { status: 415 });
    if (!Number.isFinite(size) || size <= 0 || size > maxVideoSize) return Response.json({ error: "영상은 최대 2GB까지 올릴 수 있습니다." }, { status: 413 });
    const extension = safeExtension(body.fileName ?? "video.mp4");
    const key = `gd/${playerId}/${category}/${Date.now()}-${crypto.randomUUID()}.${extension || "mp4"}`;
    const upload = await bucket().createMultipartUpload(key, {
      httpMetadata: { contentType },
      customMetadata: { playerId, contentType, category },
    });
    return Response.json({ key: upload.key, uploadId: upload.uploadId });
  }

  if (action === "multipart-complete") {
    const body = await request.json() as { key?: string; uploadId?: string; parts?: UploadedPart[] };
    if (!body.key || !body.uploadId || !isAllowedMediaKey(body.key) || !Array.isArray(body.parts) || !body.parts.length) return Response.json({ error: "업로드 완료 정보가 올바르지 않습니다." }, { status: 400 });
    const validParts = body.parts.every((part, index) => part.partNumber === index + 1 && typeof part.etag === "string" && part.etag.length > 0);
    if (!validParts) return Response.json({ error: "영상 조각 정보가 올바르지 않습니다." }, { status: 400 });
    try {
      const object = await bucket().resumeMultipartUpload(body.key, body.uploadId).complete(body.parts);
      return Response.json({ ok: true, key: body.key, etag: object.httpEtag });
    } catch (error) {
      return Response.json({ error: error instanceof Error ? error.message : "영상을 합치지 못했습니다." }, { status: 400 });
    }
  }

  const form = await request.formData();
  const playerId = String(form.get("playerId") ?? "");
  const category = String(form.get("category") ?? "");
  const file = form.get("file");
  if (!isAllowedPlayerId(playerId)) return Response.json({ error: "선수 정보가 올바르지 않습니다." }, { status: 400 });
  if (!allowedCategories.has(category)) return Response.json({ error: "미디어 카테고리를 선택해 주세요." }, { status: 400 });
  if (!(file instanceof File)) return Response.json({ error: "업로드할 파일을 선택해 주세요." }, { status: 400 });
  if (!(file.type.startsWith("image/") || file.type.startsWith("video/"))) return Response.json({ error: "사진 또는 영상 파일만 올릴 수 있습니다." }, { status: 415 });
  if (category === "photo" && !file.type.startsWith("image/")) return Response.json({ error: "사진 카테고리에는 이미지 파일만 올릴 수 있습니다." }, { status: 415 });
  if (category !== "photo" && !file.type.startsWith("video/")) return Response.json({ error: "영상 카테고리에는 영상 파일만 올릴 수 있습니다." }, { status: 415 });
  if (file.size > maxFileSize) return Response.json({ error: "파일은 100MB 이하만 올릴 수 있습니다." }, { status: 413 });

  const extension = safeExtension(file.name);
  const key = `gd/${playerId}/${category}/${Date.now()}-${crypto.randomUUID()}.${extension || "bin"}`;
  await bucket().put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
    customMetadata: { playerId, contentType: file.type, category },
  });
  return Response.json({ ok: true, key }, { status: 201 });
}

export async function PUT(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("action") !== "multipart-part") return Response.json({ error: "잘못된 업로드 요청입니다." }, { status: 400 });
  const key = url.searchParams.get("key") ?? "";
  const uploadId = url.searchParams.get("uploadId") ?? "";
  const partNumber = Number(url.searchParams.get("partNumber"));
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (!isAllowedMediaKey(key) || !uploadId || !Number.isInteger(partNumber) || partNumber < 1 || partNumber > 10000) return Response.json({ error: "영상 조각 정보가 올바르지 않습니다." }, { status: 400 });
  if (!request.body) return Response.json({ error: "영상 데이터가 없습니다." }, { status: 400 });
  if (contentLength > maxPartSize) return Response.json({ error: "영상 조각이 너무 큽니다." }, { status: 413 });
  try {
    const part = await bucket().resumeMultipartUpload(key, uploadId).uploadPart(partNumber, request.body);
    return Response.json(part);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "영상 조각 업로드에 실패했습니다." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("action") !== "multipart-abort") return Response.json({ error: "잘못된 취소 요청입니다." }, { status: 400 });
  const key = url.searchParams.get("key") ?? "";
  const uploadId = url.searchParams.get("uploadId") ?? "";
  if (!isAllowedMediaKey(key) || !uploadId) return Response.json({ error: "취소 정보가 올바르지 않습니다." }, { status: 400 });
  try {
    await bucket().resumeMultipartUpload(key, uploadId).abort();
    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 204 });
  }
}
