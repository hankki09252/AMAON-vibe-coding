import { createSupabaseAdminClient } from "./supabase/admin";

const SETTINGS_FILE = "site-settings/region-visibility.json";
export const ALL_REGIONS = ["서울", "경기", "인천", "부산", "대구", "대전", "광주", "울산", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주", "세종"];
const DEFAULT_VISIBLE_REGIONS = ["경기", "인천"];

export async function readRegionSettings() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage.from("media").download(SETTINGS_FILE);
  if (error || !data) {
    if (error && !/not found|does not exist/i.test(error.message)) throw new Error("지역 공개 설정을 확인하지 못했습니다.");
    return { visibleRegions: DEFAULT_VISIBLE_REGIONS, editingRegions: [] as string[] };
  }

  try {
    const parsed = JSON.parse(await data.text());
    const values = Array.isArray(parsed?.visibleRegions) ? parsed.visibleRegions : [];
    const visibleRegions = ALL_REGIONS.filter((region) => values.includes(region));
    const editingValues = Array.isArray(parsed?.editingRegions) ? parsed.editingRegions : [];
    const editingRegions = ALL_REGIONS.filter((region) => editingValues.includes(region) && !visibleRegions.includes(region));
    return { visibleRegions, editingRegions };
  } catch {
    return { visibleRegions: [] as string[], editingRegions: [] as string[] };
  }
}
