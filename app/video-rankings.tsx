"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TeamPlayer } from "./gd-roster";
import { youtubeEmbedUrl } from "./youtube";

type PlayerIndexItem = { player: TeamPlayer; school: string; sectionId: string };
type RankingItem = {
  key: string;
  playerId: string;
  category: "pitching" | "batting" | "fielding";
  contentType: string;
  uploadedAt: string;
  likeCount: number;
  liked: boolean;
  url: string;
  source?: "upload" | "youtube";
  videoId?: string;
  thumbnailUrl?: string;
};

const categoryLabels = { pitching: "투구영상", batting: "타격영상", fielding: "수비영상" } as const;

export default function VideoRankings({ players, visibleRegions, schoolRegions }: { players: PlayerIndexItem[]; visibleRegions: string[]; schoolRegions: Record<string, string> }) {
  const [items, setItems] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<{ item: RankingItem; match: PlayerIndexItem } | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const mutationPending = useRef(false);
  const loadSequence = useRef(0);

  const load = useCallback(async () => {
    const sequence = ++loadSequence.current;
    try {
      const response = await fetch("/api/video-rankings", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json() as { items: RankingItem[] };
      if (sequence === loadSequence.current && !mutationPending.current) setItems(data.items);
    } catch {
      // Keep the current ranking visible during a temporary connection failure.
    } finally {
      setLoading(false);
    }
  }, []);

  async function toggleLike(item: RankingItem) {
    if (mutationPending.current) return;
    mutationPending.current = true;
    ++loadSequence.current;
    setPendingKey(item.key);
    setNotice("");
    try {
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key: item.key }),
      });
      const data = await response.json().catch(() => null) as { key?: string; count?: number; liked?: boolean; error?: string } | null;
      if (!response.ok || data?.key !== item.key || typeof data.count !== "number" || typeof data.liked !== "boolean") {
        throw new Error(response.status === 401 ? "로그인이 만료되었습니다. 다시 로그인한 뒤 좋아요를 눌러주세요." : "좋아요를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      }
      const update = { likeCount: data.count, liked: data.liked };
      setItems((current) => current.map((entry) => entry.key === item.key ? { ...entry, ...update } : entry));
      setActiveVideo((current) => current?.item.key === item.key ? { ...current, item: { ...current.item, ...update } } : current);
      setNotice(data.liked ? "좋아요를 눌렀습니다." : "좋아요를 취소했습니다.");
      mutationPending.current = false;
      window.dispatchEvent(new CustomEvent("amaon:likes-changed", { detail: { key: data.key, count: data.count, liked: data.liked } }));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "연결을 확인한 뒤 다시 시도해 주세요.");
    } finally {
      mutationPending.current = false;
      setPendingKey(null);
    }
  }

  function renderLikeButton(item: RankingItem, playerName: string, modal = false) {
    const pending = pendingKey === item.key;
    return <button type="button" className={`video-ranking-likes video-ranking-like-button${item.liked ? " liked" : ""}${modal ? " in-player" : ""}`}
      aria-label={`${playerName} ${categoryLabels[item.category]} ${item.liked ? "좋아요 취소" : "좋아요"}`}
      aria-pressed={Boolean(item.liked)} aria-busy={pending} disabled={pendingKey !== null}
      onClick={() => void toggleLike(item)}>
      <span aria-hidden="true">{item.liked ? "♥" : "♡"}</span>
      <strong>{item.likeCount}</strong>
      <small>{pending ? "저장 중…" : item.liked ? "좋아요 취소" : "좋아요"}</small>
    </button>;
  }

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

  useEffect(() => {
    if (!activeVideo) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveVideo(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [activeVideo]);

  return <>
    <section className="video-ranking-section" id="video-ranking">
      <div className="section-console-bar inverted">
        <span><i /> 03 · FILM ROOM</span>
        <small>MEMBER PICKS · LIVE RANKING</small>
      </div>
      <div className="video-ranking-heading">
        <div><p className="kicker dark"><span /> MOST LIKED FILMS</p><h2>좋아요 TOP 5 영상</h2></div>
        <p>회원들이 가장 많이 좋아한 선수 영상을 만나보세요.<br />영상 영역은 재생, 하트는 좋아요를 누르는 버튼입니다.</p>
      </div>
      {notice && !activeVideo && <p className="video-ranking-notice" role="status">{notice}</p>}
      {ranked.length ? (
        <div className="video-ranking-list">
          {ranked.map(({ item, match }, index) => (
            <article className={`video-ranking-card rank-${index + 1}`} key={item.key}>
              <button type="button" className="video-ranking-play-trigger" aria-label={`${index + 1}위 ${match.player.name} ${categoryLabels[item.category]} 재생`} onClick={() => { setNotice(""); setActiveVideo({ item, match }); }} />
              <span className="video-ranking-number"><small>RANK</small>{index + 1}</span>
              <div className="video-ranking-preview">{item.source === "youtube" && item.thumbnailUrl ? <img src={item.thumbnailUrl} alt={`${match.player.name} 유튜브 영상 미리보기`} /> : <video src={item.url} muted playsInline preload="metadata" />}<span>▶</span></div>
              <div className="video-ranking-player">
                <small>{match.school} · {categoryLabels[item.category]}</small>
                <strong><em>{match.player.number}</em> {match.player.name}</strong>
                <span>{match.player.position} · {match.player.grade}</span>
              </div>
              {renderLikeButton(item, match.player.name)}
              <b className="video-ranking-open"><span>PLAY</span> 영상 보기 ↗</b>
            </article>
          ))}
        </div>
      ) : (
        <div className="video-ranking-empty"><span>▶</span><strong>{loading ? "영상 순위를 불러오는 중입니다." : "아직 순위에 등록된 영상이 없습니다."}</strong><p>영상에 좋아요가 쌓이면 상위 5개가 이곳에 표시됩니다.</p></div>
      )}
    </section>
    {activeVideo && <section className="video-ranking-player-modal" role="dialog" aria-modal="true" aria-label={`${activeVideo.match.player.name} 영상 재생`}>
      <button type="button" className="video-ranking-player-close" onClick={() => setActiveVideo(null)} aria-label="영상 닫기">×</button>
      <div className="video-ranking-player-stage">
        {activeVideo.item.source === "youtube" && activeVideo.item.videoId
          ? <iframe src={youtubeEmbedUrl(activeVideo.item.videoId, true)} title={`${activeVideo.match.player.name} ${categoryLabels[activeVideo.item.category]}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
          : <video src={activeVideo.item.url} controls autoPlay playsInline />}
      </div>
      <div className="video-ranking-player-meta">
        <small>{activeVideo.match.school} · {categoryLabels[activeVideo.item.category]}</small>
        <strong><em>{activeVideo.match.player.number}</em> {activeVideo.match.player.name}</strong>
        <span>{activeVideo.match.player.position} · {activeVideo.match.player.grade}</span>
      </div>
      <div className="video-ranking-player-like">
        {renderLikeButton(items.find((item) => item.key === activeVideo.item.key) ?? activeVideo.item, activeVideo.match.player.name, true)}
        {notice && <p className="video-ranking-notice" role="status">{notice}</p>}
      </div>
    </section>}
  </>;
}
