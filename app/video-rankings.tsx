"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { TeamPlayer } from "./gd-roster";

type PlayerIndexItem = { player: TeamPlayer; school: string; sectionId: string };
type RankingItem = {
  key: string;
  playerId: string;
  category: "pitching" | "batting" | "fielding";
  contentType: string;
  uploadedAt: string;
  likeCount: number;
  url: string;
  source?: "upload" | "youtube";
  videoId?: string;
  thumbnailUrl?: string;
};

const categoryLabels = { pitching: "투구영상", batting: "타격영상", fielding: "수비영상" } as const;

export default function VideoRankings({ players, visibleRegions, schoolRegions }: { players: PlayerIndexItem[]; visibleRegions: string[]; schoolRegions: Record<string, string> }) {
  const [items, setItems] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/video-rankings", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json() as { items: RankingItem[] };
      setItems(data.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const refresh = () => void load();
    window.addEventListener("amaon:likes-changed", refresh);
    return () => window.removeEventListener("amaon:likes-changed", refresh);
  }, [load]);

  const ranked = useMemo(() => items.flatMap((item) => {
    const basePlayerId = item.playerId.includes("--") ? item.playerId.slice(item.playerId.indexOf("--") + 2) : item.playerId;
    const sectionFromId = item.playerId.includes("--") ? item.playerId.slice(0, item.playerId.indexOf("--")) : "";
    const match = players.find((entry) => entry.player.id === basePlayerId && (!sectionFromId || entry.sectionId === sectionFromId));
    if (!match || !visibleRegions.includes(schoolRegions[match.school])) return [];
    return [{ item, match }];
  }).slice(0, 5), [items, players, schoolRegions, visibleRegions]);

  function openRankedVideo(item: RankingItem, match: PlayerIndexItem) {
    const url = new URL(window.location.href);
    url.searchParams.set("team", match.sectionId);
    url.searchParams.set("player", match.player.id);
    url.searchParams.set("media", item.key);
    url.hash = match.sectionId;
    window.location.assign(url.toString());
  }

  return (
    <section className="video-ranking-section" id="video-ranking">
      <div className="video-ranking-heading">
        <div><p className="kicker dark"><span /> MOST LIKED FILMS</p><h2>좋아요 TOP 5 영상</h2></div>
        <p>회원들이 가장 많이 좋아한 선수 영상을 만나보세요.<br />순위를 누르면 해당 영상이 바로 재생됩니다.</p>
      </div>
      {ranked.length ? (
        <div className="video-ranking-list">
          {ranked.map(({ item, match }, index) => (
            <button type="button" className={`video-ranking-card rank-${index + 1}`} key={item.key} onClick={() => openRankedVideo(item, match)}>
              <span className="video-ranking-number"><small>RANK</small>{index + 1}</span>
              <div className="video-ranking-preview">{item.source === "youtube" && item.thumbnailUrl ? <img src={item.thumbnailUrl} alt={`${match.player.name} 유튜브 영상 미리보기`} /> : <video src={item.url} muted playsInline preload="metadata" />}<span>▶</span></div>
              <div className="video-ranking-player">
                <small>{match.school} · {categoryLabels[item.category]}</small>
                <strong><em>{match.player.number}</em> {match.player.name}</strong>
                <span>{match.player.position} · {match.player.grade}</span>
              </div>
              <div className="video-ranking-likes"><span>♥</span><strong>{item.likeCount}</strong><small>LIKES</small></div>
              <b className="video-ranking-open">영상 보기 ↗</b>
            </button>
          ))}
        </div>
      ) : (
        <div className="video-ranking-empty"><span>▶</span><strong>{loading ? "영상 순위를 불러오는 중입니다." : "아직 순위에 등록된 영상이 없습니다."}</strong><p>영상에 좋아요가 쌓이면 상위 5개가 이곳에 표시됩니다.</p></div>
      )}
    </section>
  );
}
