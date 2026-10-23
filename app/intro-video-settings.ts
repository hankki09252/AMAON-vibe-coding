import { createSupabaseAdminClient } from "./supabase/admin";
import { DEFAULT_INTRO_VIDEO_URL, parseIntroVideoUrl } from "./intro-video";

export const INTRO_VIDEO_SETTINGS_FILE = "site-settings/intro-video.json";

export async function readIntroVideoUrl(): Promise<string> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage.from("media").download(INTRO_VIDEO_SETTINGS_FILE);
  if (error || !data) return DEFAULT_INTRO_VIDEO_URL;

  try {
    const stored = JSON.parse(await data.text()) as { url?: unknown };
    return typeof stored.url === "string"
      ? parseIntroVideoUrl(stored.url)?.url ?? DEFAULT_INTRO_VIDEO_URL
      : DEFAULT_INTRO_VIDEO_URL;
  } catch {
    return DEFAULT_INTRO_VIDEO_URL;
  }
}
