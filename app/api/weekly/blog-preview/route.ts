import { apiAdmin } from "../../../api-auth";
import { allowedNaverImageUrl, normalizeNaverBlogUrl } from "../../../weekly/weekly-blog-link";

function decodeEntities(value: string) {
  return value.replace(/&#(x[0-9a-f]+|\d+);|&(?:amp|quot|apos|lt|gt|nbsp);/gi, (entity, number: string | undefined) => {
    if (number) {
      const code = number[0].toLowerCase() === "x" ? parseInt(number.slice(1), 16) : parseInt(number, 10);
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "";
    }
    return ({ "&amp;": "&", "&quot;": '"', "&apos;": "'", "&lt;": "<", "&gt;": ">", "&nbsp;": " " } as Record<string, string>)[entity.toLowerCase()] || entity;
  });
}

function metaValue(html: string, key: string) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const attrs = Object.fromEntries(Array.from(tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g), (match) => [match[1].toLowerCase(), match[2] ?? match[3] ?? ""]));
    if ((attrs.property || attrs.name || "").toLowerCase() === key) return decodeEntities(attrs.content || "").trim();
  }
  return "";
}

async function readLimited(response: Response, maxBytes: number) {
  if (!response.body) throw new Error("빈 응답입니다.");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) throw new Error("응답 크기를 초과했습니다.");
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }
  const result = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.byteLength; }
  return result;
}

export async function POST(request: Request) {
  const { role } = await apiAdmin();
  if (!role) return Response.json({ error: "운영자 권한이 필요합니다." }, { status: 403 });
  const input = await request.json().catch(() => ({}));
  const url = normalizeNaverBlogUrl(String(input.url || ""));
  if (!url) return Response.json({ error: "네이버 블로그 게시물 주소를 입력해 주세요." }, { status: 400 });
  try {
    const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(8000), headers: { "User-Agent": "Mozilla/5.0 (compatible; AMAONWeeklyPreview/1.0)" }, cache: "no-store" });
    if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) throw new Error("블로그 화면을 읽을 수 없습니다.");
    const html = new TextDecoder().decode(await readLimited(response, 1_000_000));
    const rawTitle = metaValue(html, "og:title") || decodeEntities(html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || "");
    const image = metaValue(html, "og:image").replace(/^http:\/\//i, "https://");
    return Response.json({ url, title: rawTitle.replace(/\s*:\s*네이버 블로그\s*$/, "").slice(0, 120), summary: (metaValue(html, "og:description") || metaValue(html, "description")).slice(0, 240), imageUrl: allowedNaverImageUrl(image) || "" }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ url, title: "", summary: "", imageUrl: "", notice: "자동 미리보기를 가져오지 못했습니다. 제목·소개·대표 이미지를 직접 입력해 주세요." }, { headers: { "Cache-Control": "private, no-store" } });
  }
}

export async function GET(request: Request) {
  const { role } = await apiAdmin();
  if (!role) return new Response("Forbidden", { status: 403 });
  const imageUrl = allowedNaverImageUrl(new URL(request.url).searchParams.get("image") || "");
  if (!imageUrl) return new Response("Invalid image URL", { status: 400 });
  try {
    const response = await fetch(imageUrl, { redirect: "manual", signal: AbortSignal.timeout(8000), cache: "no-store" });
    const type = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() || "";
    if (!response.ok || !["image/jpeg", "image/png", "image/webp"].includes(type)) return new Response("Image unavailable", { status: 422 });
    const bytes = await readLimited(response, 4 * 1024 * 1024);
    return new Response(bytes, { headers: { "Content-Type": type, "Cache-Control": "private, no-store" } });
  } catch {
    return new Response("Image unavailable", { status: 422 });
  }
}
