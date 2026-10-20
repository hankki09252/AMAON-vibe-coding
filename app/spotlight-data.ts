import "server-only";
import { createSupabaseAdminClient } from "./supabase/admin";
import { publicAccess } from "./public-access";

export type SpotlightPlatform = "instagram" | "threads" | "blog";
export type PlayerSpotlight = {
  id: string;
  teamId: string;
  playerId: string;
  playerName: string;
  schoolName: string;
  platform: SpotlightPlatform;
  postUrl: string;
  title: string;
  summary: string;
};

type SpotlightRow = {
  id: string; team_id: string; player_id: string; player_name: string; school_name: string;
  platform: SpotlightPlatform; post_url: string; title: string; summary: string;
};

export async function readPublishedSpotlights(): Promise<PlayerSpotlight[]> {
  const { data, error } = await createSupabaseAdminClient().from("player_spotlights")
    .select("id,team_id,player_id,player_name,school_name,platform,post_url,title,summary")
    .eq("published", true).order("sort_order", { ascending: true })
    .order("created_at", { ascending: false }).limit(12);
  if (error) throw new Error("선수 콘텐츠를 불러오지 못했습니다.");
  const rows = (data || []) as SpotlightRow[];
  if (!rows.length) return [];
  const access = await publicAccess(rows.map((row) => row.player_id));
  return rows.filter((row) => access.player(row.player_id, row.team_id)).map((row) => ({
    id: row.id, teamId: row.team_id, playerId: row.player_id,
    playerName: row.player_name, schoolName: row.school_name,
    platform: row.platform, postUrl: row.post_url, title: row.title, summary: row.summary,
  }));
}
