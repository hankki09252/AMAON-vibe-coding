export type SpotlightPlatform = "instagram" | "threads" | "blog";

export function parseSpotlightUrl(value: string): { platform: SpotlightPlatform; url: string } | null {
  let parsed: URL;
  try { parsed = new URL(value.trim()); } catch { return null; }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.port) return null;
  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname.replace(/\/+$/, "");
  let platform: SpotlightPlatform;
  if (["instagram.com", "www.instagram.com"].includes(host) && /^\/(p|reel|tv)\/[A-Za-z0-9_-]+$/.test(path)) platform = "instagram";
  else if (["threads.net", "www.threads.net", "threads.com", "www.threads.com"].includes(host)
    && (/^\/@[A-Za-z0-9._]+\/post\/[A-Za-z0-9_-]+$/.test(path) || /^\/t\/[A-Za-z0-9_-]+$/.test(path))) platform = "threads";
  else if (["blog.naver.com", "m.blog.naver.com"].includes(host)
    && (/^\/[^/]+\/\d+$/.test(path) || (path === "/PostView.naver" && parsed.searchParams.has("blogId") && parsed.searchParams.has("logNo")))) platform = "blog";
  else if ((host === "tistory.com" || host.endsWith(".tistory.com")) && path.length > 1) platform = "blog";
  else return null;
  return { platform, url: platform === "blog" ? `https://${host}${path}${parsed.search}` : `https://${host}${path}/` };
}
