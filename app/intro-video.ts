export const DEFAULT_INTRO_VIDEO_URL = "https://www.instagram.com/reel/DezCYOETWr9/";

export type IntroVideo = {
  url: string;
  embedUrl: string;
  platform: "instagram" | "youtube";
};

export function parseIntroVideoUrl(value: string): IntroVideo | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:") return null;

    if (url.hostname === "instagram.com" || url.hostname === "www.instagram.com") {
      const match = url.pathname.match(/^\/reel\/([A-Za-z0-9_-]{5,30})\/?$/);
      if (!match) return null;
      return {
        url: `https://www.instagram.com/reel/${match[1]}/`,
        embedUrl: `https://www.instagram.com/reel/${match[1]}/embed/`,
        platform: "instagram",
      };
    }

    let videoId: string | undefined;
    if (url.hostname === "youtu.be") videoId = url.pathname.match(/^\/([A-Za-z0-9_-]{11})\/?$/)?.[1];
    if (url.hostname === "youtube.com" || url.hostname === "www.youtube.com") {
      videoId = url.pathname.match(/^\/(?:shorts|embed)\/([A-Za-z0-9_-]{11})\/?$/)?.[1]
        ?? (url.pathname === "/watch" ? url.searchParams.get("v") ?? undefined : undefined);
    }
    if (videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId)) {
      return {
        url: `https://www.youtube.com/watch?v=${videoId}`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
        platform: "youtube",
      };
    }
  } catch {
    // Reject malformed and unsupported URLs.
  }
  return null;
}
