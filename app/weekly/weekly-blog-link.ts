const blogMarker = "AMAON_BLOG_LINK_V1\n";

export function normalizeNaverBlogUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || !["blog.naver.com", "m.blog.naver.com"].includes(url.hostname.toLowerCase()) || url.port || url.username || url.password) return null;
    let blogId = "";
    let logNo = "";
    if (url.pathname.toLowerCase() === "/postview.naver") {
      blogId = url.searchParams.get("blogId") || "";
      logNo = url.searchParams.get("logNo") || "";
    } else {
      const match = url.pathname.match(/^\/([a-zA-Z0-9_-]+)\/(\d+)\/?$/);
      if (match) [, blogId, logNo] = match;
    }
    if (!/^[a-zA-Z0-9_-]{2,50}$/.test(blogId) || !/^\d{5,20}$/.test(logNo)) return null;
    return `https://m.blog.naver.com/${blogId}/${logNo}`;
  } catch {
    return null;
  }
}

export function blogBody(url: string): string {
  const normalized = normalizeNaverBlogUrl(url);
  if (!normalized) throw new Error("네이버 블로그 게시물 주소를 확인해 주세요.");
  return `${blogMarker}${normalized}`;
}

export function blogUrlFromBody(body: string): string | null {
  if (!body.startsWith(blogMarker)) return null;
  return normalizeNaverBlogUrl(body.slice(blogMarker.length));
}

export function allowedNaverImageUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "https:" || url.port || url.username || url.password || !(host === "pstatic.net" || host.endsWith(".pstatic.net"))) return null;
    return url.toString();
  } catch {
    return null;
  }
}
