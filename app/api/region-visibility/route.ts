import { NextRequest, NextResponse } from "next/server";
import { apiAdmin } from "../../api-auth";
import { createSupabaseAdminClient } from "../../supabase/admin";

import { readRegionSettings, ALL_REGIONS } from "../../region-settings";
const SETTINGS_FILE = "site-settings/region-visibility.json";

export async function GET() {
  const { role } = await apiAdmin();
  const settings = await readRegionSettings();
  return NextResponse.json(role ? settings : { visibleRegions: settings.visibleRegions }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: NextRequest) {
  const { user, role } = await apiAdmin();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  if (!role) return NextResponse.json({ error: "운영자만 지역 공개 설정을 변경할 수 있습니다." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const requested = Array.isArray(body?.visibleRegions) ? body.visibleRegions : [];
  const visibleRegions = ALL_REGIONS.filter((region) => requested.includes(region));
  const requestedEditing = Array.isArray(body?.editingRegions) ? body.editingRegions : [];
  const editingRegions = ALL_REGIONS.filter((region) => requestedEditing.includes(region) && !visibleRegions.includes(region));
  if (!visibleRegions.length) {
    return NextResponse.json({ error: "공개할 지역을 한 곳 이상 선택해 주세요." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const payload = JSON.stringify({ visibleRegions, editingRegions, updatedAt: new Date().toISOString(), updatedBy: user.email });
  const { error } = await supabase.storage.from("media").upload(SETTINGS_FILE, payload, {
    contentType: "application/json; charset=utf-8",
    upsert: true,
  });
  if (error) return NextResponse.json({ error: `설정을 저장하지 못했습니다: ${error.message}` }, { status: 500 });

  return NextResponse.json({ visibleRegions, editingRegions });
}
