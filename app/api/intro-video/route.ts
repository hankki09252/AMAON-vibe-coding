import { NextRequest, NextResponse } from "next/server";
import { apiAdmin } from "../../api-auth";
import { INTRO_VIDEO_SETTINGS_FILE } from "../../intro-video-settings";
import { parseIntroVideoUrl } from "../../intro-video";
import { createSupabaseAdminClient } from "../../supabase/admin";

export async function PUT(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: "허용되지 않은 요청입니다." }, { status: 403 });

  const { user, role } = await apiAdmin();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  if (role !== "admin") return NextResponse.json({ error: "운영자만 소개 영상을 교체할 수 있습니다." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const video = typeof body?.url === "string" && body.url.length <= 300 ? parseIntroVideoUrl(body.url) : null;
  if (!video) return NextResponse.json({ error: "인스타그램 릴스 또는 유튜브 영상 링크를 입력해 주세요." }, { status: 400 });

  const payload = JSON.stringify({ url: video.url, updatedAt: new Date().toISOString(), updatedBy: user.email });
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.from("media").upload(INTRO_VIDEO_SETTINGS_FILE, payload, {
    contentType: "application/json; charset=utf-8",
    upsert: true,
  });
  if (error) return NextResponse.json({ error: "소개 영상을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요." }, { status: 500 });

  return NextResponse.json({ url: video.url }, { headers: { "Cache-Control": "no-store" } });
}
