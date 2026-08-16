import { NextRequest, NextResponse } from "next/server";
import { apiAdmin, apiUser } from "../../api-auth";
import { createSupabaseAdminClient } from "../../supabase/admin";

const SETTINGS_FILE = "site-settings/region-visibility.json";
const ALL_REGIONS = ["서울", "경기", "인천", "부산", "대구", "대전", "광주", "울산", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주", "세종"];
const DEFAULT_VISIBLE_REGIONS = ["경기", "인천"];

async function readVisibleRegions() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage.from("media").download(SETTINGS_FILE);
  if (error || !data) return DEFAULT_VISIBLE_REGIONS;

  try {
    const parsed = JSON.parse(await data.text());
    const values = Array.isArray(parsed?.visibleRegions) ? parsed.visibleRegions : [];
    const valid = ALL_REGIONS.filter((region) => values.includes(region));
    return valid.length ? valid : DEFAULT_VISIBLE_REGIONS;
  } catch {
    return DEFAULT_VISIBLE_REGIONS;
  }
}

export async function GET() {
  const user = await apiUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  return NextResponse.json(
    { visibleRegions: await readVisibleRegions() },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function PUT(request: NextRequest) {
  const { user, role } = await apiAdmin();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  if (!role) return NextResponse.json({ error: "운영자만 지역 공개 설정을 변경할 수 있습니다." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const requested = Array.isArray(body?.visibleRegions) ? body.visibleRegions : [];
  const visibleRegions = ALL_REGIONS.filter((region) => requested.includes(region));
  if (!visibleRegions.length) {
    return NextResponse.json({ error: "공개할 지역을 한 곳 이상 선택해 주세요." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const payload = JSON.stringify({ visibleRegions, updatedAt: new Date().toISOString(), updatedBy: user.email });
  const { error } = await supabase.storage.from("media").upload(SETTINGS_FILE, payload, {
    contentType: "application/json; charset=utf-8",
    upsert: true,
  });
  if (error) return NextResponse.json({ error: `설정을 저장하지 못했습니다: ${error.message}` }, { status: 500 });

  return NextResponse.json({ visibleRegions });
}
