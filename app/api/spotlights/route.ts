import { randomUUID } from "crypto";
import { apiAdmin, validPlayerId, validTeamId } from "../../api-auth";
import { publicAccess } from "../../public-access";
import { createSupabaseAdminClient } from "../../supabase/admin";
import { parseSpotlightUrl } from "../../spotlight-url";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const plain = (value: unknown, max: number) => typeof value === "string" ? value.replace(/\0/g, "").trim().slice(0, max) : "";

export async function GET() {
  const { role } = await apiAdmin();
  if (!role) return Response.json({ error: "운영자 권한이 필요합니다." }, { status: 403 });
  const { data, error } = await createSupabaseAdminClient().from("player_spotlights").select("*")
    .order("created_at", { ascending: false });
  if (error) return Response.json({ error: "게시물 목록을 불러오지 못했습니다." }, { status: 500 });
  return Response.json({ items: data || [] }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  const { user, role } = await apiAdmin();
  if (!user || !role) return Response.json({ error: "운영자 권한이 필요합니다." }, { status: 403 });
  const input = await request.json().catch(() => null);
  if (!input || typeof input !== "object") return Response.json({ error: "입력 정보를 확인해 주세요." }, { status: 400 });
  const id = plain(input.id, 40);
  const teamId = plain(input.teamId, 80);
  const playerId = plain(input.playerId, 80);
  const playerName = plain(input.playerName, 80);
  const schoolName = plain(input.schoolName, 100);
  const title = plain(input.title, 120);
  const summary = plain(input.summary, 240);
  const link = parseSpotlightUrl(plain(input.postUrl, 500));
  const sortOrder = Number(input.sortOrder ?? 0);
  if ((id && !uuid.test(id)) || !validTeamId(teamId) || !validPlayerId(playerId) || !playerName || !schoolName
    || !link || !Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 999) {
    return Response.json({ error: "선수와 게시물 링크를 다시 확인해 주세요. 인스타그램·스레드·네이버 블로그·티스토리 글을 지원합니다." }, { status: 400 });
  }
  const access = await publicAccess([playerId]);
  if (!access.player(playerId, teamId)) return Response.json({ error: "공개 가능한 선수만 등록할 수 있습니다." }, { status: 400 });
  const row = { id: id || randomUUID(), team_id: teamId, player_id: playerId,
    player_name: playerName, school_name: schoolName, platform: link.platform, post_url: link.url,
    title: title || `${playerName} 선수의 이야기`, summary,
    published: input.published === true, sort_order: sortOrder, updated_at: new Date().toISOString(),
    created_by: user.email || "admin" };
  const db = createSupabaseAdminClient();
  const { error } = id ? await db.from("player_spotlights").update(row).eq("id", id)
    : await db.from("player_spotlights").insert(row);
  if (error) return Response.json({ error: error.code === "23505" ? "이미 등록된 게시물 링크입니다." : "게시물을 저장하지 못했습니다." }, { status: 500 });
  return Response.json({ ok: true, id: row.id });
}

export async function DELETE(request: Request) {
  const { role } = await apiAdmin();
  if (!role) return Response.json({ error: "운영자 권한이 필요합니다." }, { status: 403 });
  const input = await request.json().catch(() => null);
  const id = plain(input?.id, 40);
  if (!uuid.test(id)) return Response.json({ error: "삭제할 게시물을 확인해 주세요." }, { status: 400 });
  const { error } = await createSupabaseAdminClient().from("player_spotlights").delete().eq("id", id);
  if (error) return Response.json({ error: "게시물을 삭제하지 못했습니다." }, { status: 500 });
  return Response.json({ ok: true });
}
