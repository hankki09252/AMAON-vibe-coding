import { cache } from "react";
import { createSupabaseAdminClient } from "../supabase/admin";

export type WeeklyPost = {
  id: string;
  issueNumber: number;
  slug: string;
  title: string;
  summary: string;
  oneIssueTitle: string;
  body: string;
  onMessage: string;
  coverStorageKey: string;
  teamId: string;
  playerId: string;
  playerName: string;
  schoolName: string;
  position: string;
  published: boolean;
  publishedAt: string;
  updatedAt: string;
};

type WeeklyRow = {
  id: string;
  issue_number: number;
  slug: string;
  title: string;
  summary: string;
  one_issue_title: string;
  body: string;
  on_message: string;
  cover_storage_key: string | null;
  team_id: string | null;
  player_id: string | null;
  player_name: string | null;
  school_name: string | null;
  position: string | null;
  published: boolean;
  published_at: string | null;
  updated_at: string;
};

const fields = "id,issue_number,slug,title,summary,one_issue_title,body,on_message,cover_storage_key,team_id,player_id,player_name,school_name,position,published,published_at,updated_at";

function mapPost(row: WeeklyRow): WeeklyPost {
  return {
    id: row.id,
    issueNumber: row.issue_number,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    oneIssueTitle: row.one_issue_title,
    body: row.body,
    onMessage: row.on_message,
    coverStorageKey: row.cover_storage_key || "",
    teamId: row.team_id || "",
    playerId: row.player_id || "",
    playerName: row.player_name || "",
    schoolName: row.school_name || "",
    position: row.position || "",
    published: row.published,
    publishedAt: row.published_at || row.updated_at,
    updatedAt: row.updated_at,
  };
}

export async function readPublishedWeekly(limit = 20): Promise<WeeklyPost[]> {
  const { data, error } = await createSupabaseAdminClient()
    .from("weekly_posts")
    .select(fields)
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(Math.max(1, Math.min(limit, 50)));
  if (error) throw new Error("AMAON WEEKLY를 불러오지 못했습니다.");
  return ((data || []) as WeeklyRow[]).map(mapPost);
}

export const readWeeklyBySlug = cache(async (slug: string): Promise<WeeklyPost | null> => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  const { data, error } = await createSupabaseAdminClient()
    .from("weekly_posts")
    .select(fields)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw new Error("AMAON WEEKLY 글을 불러오지 못했습니다.");
  return data ? mapPost(data as WeeklyRow) : null;
});

export function weeklyCoverUrl(post: Pick<WeeklyPost, "id" | "coverStorageKey">) {
  return post.coverStorageKey ? `/api/weekly/cover/${post.id}` : "/og.png";
}

export function weeklyPlayerUrl(post: Pick<WeeklyPost, "teamId" | "playerId">) {
  if (!post.teamId || !post.playerId) return "/#players";
  return `/?team=${encodeURIComponent(post.teamId)}&player=${encodeURIComponent(post.playerId)}#${encodeURIComponent(post.teamId)}`;
}
