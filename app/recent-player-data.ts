import { createSupabaseAdminClient } from "./supabase/admin";
import { publicAccess } from "./public-access";
import { presentMedia } from "./media-read";
import legacyTeams from "./legacy-player-teams.json";

export type RecentPlayerProfile = {
  playerId: string;
  teamId: string;
  updateType: "신규 등록" | "프로필 업데이트" | "사진 업데이트" | "영상 추가" | "선수 정보 업데이트";
  updatedAt: string;
  updatedLabel: string;
  cardImageUrl: string;
};

type RecentEvent = {
  playerId: string;
  teamId?: string;
  updatedAt: string;
  updateType: RecentPlayerProfile["updateType"];
};

type MediaRow = { storage_key: string; player_id: string; category: "pitching" | "batting" | "fielding" | "photo" | "profile"; content_type: string; uploaded_at: string };
type RosterRow = { player_id: string; team_id: string; hidden: boolean; created: boolean; updated_at: string };
type ProfileRow = { player_id: string; team_id: string; updated_at: string };

const candidateLimit = 80;
const displayLimit = 10;

function eventTime(event: RecentEvent) {
  return new Date(event.updatedAt).getTime();
}

function updateLabel(updatedAt: string) {
  return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric" }).format(new Date(updatedAt));
}

function mediaPlayer(value: string) {
  const separator = value.indexOf("--");
  return separator < 0 ? { playerId: value, teamId: undefined } : { playerId: value.slice(separator + 2), teamId: value.slice(0, separator) };
}

export async function readRecentPlayerProfiles(): Promise<RecentPlayerProfile[]> {
  const db = createSupabaseAdminClient();
  const [mediaResult, profileResult, rosterResult] = await Promise.all([
    db.from("media_items").select("storage_key,player_id,category,content_type,uploaded_at").order("uploaded_at", { ascending: false }).limit(candidateLimit),
    db.from("player_profile_overrides").select("player_id,team_id,updated_at").order("updated_at", { ascending: false }).limit(candidateLimit),
    db.from("roster_players").select("player_id,team_id,hidden,created,updated_at").order("updated_at", { ascending: false }).limit(candidateLimit),
  ]);
  if (mediaResult.error || profileResult.error || rosterResult.error) throw new Error("최근 선수 프로필을 불러오지 못했습니다.");

  const mediaRows = (mediaResult.data || []) as MediaRow[];
  const profileRows = (profileResult.data || []) as ProfileRow[];
  const rosterRows = (rosterResult.data || []) as RosterRow[];
  const events: RecentEvent[] = [
    ...mediaRows.map((row) => ({
      ...mediaPlayer(row.player_id),
      updatedAt: row.uploaded_at,
      updateType: row.category === "profile" || row.category === "photo" ? "사진 업데이트" as const : "영상 추가" as const,
    })),
    ...profileRows.map((row) => ({ playerId: row.player_id, teamId: row.team_id, updatedAt: row.updated_at, updateType: "프로필 업데이트" as const })),
    ...rosterRows.map((row) => ({ playerId: row.player_id, teamId: row.team_id, updatedAt: row.updated_at, updateType: row.created ? "신규 등록" as const : "선수 정보 업데이트" as const })),
  ].sort((a, b) => eventTime(b) - eventTime(a));

  const newestByPlayer = new Map<string, RecentEvent>();
  for (const event of events) {
    if (!newestByPlayer.has(event.playerId)) newestByPlayer.set(event.playerId, event);
    if (newestByPlayer.size >= 60) break;
  }
  const candidates = [...newestByPlayer.values()];
  if (!candidates.length) return [];

  const candidateIds = candidates.map((event) => event.playerId);
  const { data: currentRoster, error: rosterLookupError } = await db
    .from("roster_players")
    .select("player_id,team_id,hidden,created,updated_at")
    .in("player_id", candidateIds);
  if (rosterLookupError) throw new Error("최근 선수 소속을 확인하지 못했습니다.");
  const rosterByPlayer = new Map(((currentRoster || []) as RosterRow[]).map((row) => [row.player_id, row]));
  const access = await publicAccess(candidateIds);
  const visible = candidates.flatMap((event) => {
    const current = rosterByPlayer.get(event.playerId);
    const teamId = current?.team_id || event.teamId || (legacyTeams as Record<string, string>)[event.playerId];
    return teamId && !current?.hidden && access.player(event.playerId, teamId) ? [{ ...event, teamId }] : [];
  }).slice(0, displayLimit);
  if (!visible.length) return [];

  const visibleIds = visible.flatMap((event) => [event.playerId, `${event.teamId}--${event.playerId}`]);
  const { data: previews, error: previewError } = await db
    .from("media_items")
    .select("storage_key,player_id,category,content_type,uploaded_at")
    .in("player_id", visibleIds)
    .order("uploaded_at", { ascending: false })
    .limit(displayLimit * 20);
  if (previewError) throw new Error("최근 선수 미리보기를 불러오지 못했습니다.");
  const previewsByPlayer = new Map<string, MediaRow[]>();
  for (const row of (previews || []) as MediaRow[]) {
    const playerId = mediaPlayer(row.player_id).playerId;
    previewsByPlayer.set(playerId, [...(previewsByPlayer.get(playerId) || []), row]);
  }
  const selectedPreviews = visible.flatMap((event) => {
    const items = previewsByPlayer.get(event.playerId) || [];
    const row = items.find((item) => item.category === "profile")
      || items.find((item) => item.category === "photo")
      || items.find((item) => item.storage_key.startsWith("youtube/"));
    return row ? [row] : [];
  });
  const presentedPreviews = await presentMedia(selectedPreviews);
  const previewByPlayer = new Map(presentedPreviews.map((item) => [mediaPlayer(item.playerId).playerId, item.thumbnailUrl || item.url]));

  return visible.map((event) => ({
    playerId: event.playerId,
    teamId: event.teamId,
    updateType: event.updateType,
    updatedAt: event.updatedAt,
    updatedLabel: updateLabel(event.updatedAt),
    cardImageUrl: previewByPlayer.get(event.playerId) || "",
  }));
}
