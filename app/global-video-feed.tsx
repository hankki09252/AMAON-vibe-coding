"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TeamPlayer } from "./gd-roster";
import { offerMemberLogin } from "./member-login";
import { youtubeEmbedUrl } from "./youtube";

type PlayerIndexItem = { player: TeamPlayer; school: string; sectionId: string };
type FeedItem = {
  key: string;
  playerId: string;
  category: "pitching" | "batting" | "fielding";
  uploadedAt: string;
  likeCount: number;
  liked: boolean;
  url: string;
  source?: "upload" | "youtube";
  videoId?: string;
  thumbnailUrl?: string;
};

const labels = { pitching: "투구영상", batting: "타격영상", fielding: "수비영상" } as const;

export default function GlobalVideoFeed({ open, onClose, players, onOpenPlayer }: {
  open: boolean;
  onClose: () => void;
  players: PlayerIndexItem[];
  onOpenPlayer?: (player: PlayerIndexItem) => void;
}) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [cursor, setCursor] = useState<string | null | undefined>(undefined);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const findPlayer = useCallback((item: FeedItem) => {
    const split = item.playerId.indexOf("--");
    const sectionId = split >= 0 ? item.playerId.slice(0, split) : "";
    const playerId = split >= 0 ? item.playerId.slice(split + 2) : item.playerId;
    return players.find((entry) => entry.player.id === playerId && (!sectionId || entry.sectionId === sectionId));
  }, [players]);

  const loadMore = useCallback(async (nextCursor?: string | null) => {
    if (loadingRef.current || (nextCursor === null && items.length > 0)) return;
    loadingRef.current = true;
    setLoading(true);
    setNotice("");
    try {
      const query = nextCursor ? `?cursor=${encodeURIComponent(nextCursor)}` : "";
      const response = await fetch(`/api/video-feed${query}`, { cache: "no-store" });
      if (!response.ok) throw new Error("영상을 불러오지 못했습니다.");
      const data = await response.json() as { items: FeedItem[]; nextCursor: string | null };
      setItems((current) => {
        const known = new Set(current.map((item) => item.key));
        return [...current, ...data.items.filter((item) => !known.has(item.key))];
      });
      setCursor(data.nextCursor);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "연결을 확인해 주세요.");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [items.length, loading]);

  useEffect(() => {
    if (!open) return;
    setItems([]);
    setCursor(undefined);
    setActiveIndex(0);
    void loadMore(undefined);
  // A newly opened feed always starts with fresh public videos.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowDown") scrollTo(activeIndex + 1);
      if (event.key === "ArrowUp") scrollTo(activeIndex - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [activeIndex, onClose, open]);

  useEffect(() => {
    if (!open || !viewportRef.current) return;
    const root = viewportRef.current;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const index = Number((visible.target as HTMLElement).dataset.index);
      if (Number.isFinite(index)) setActiveIndex(index);
    }, { root, threshold: [.55, .75] });
    root.querySelectorAll("[data-feed-slide]").forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [items.length, open]);

  useEffect(() => {
    if (open && cursor && activeIndex >= items.length - 3) void loadMore(cursor);
  }, [activeIndex, cursor, items.length, loadMore, open]);

  function scrollTo(index: number) {
    const safeIndex = Math.max(0, Math.min(items.length - 1, index));
    viewportRef.current?.querySelector<HTMLElement>(`[data-index="${safeIndex}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function toggleLike(item: FeedItem) {
    if (pendingKey) return;
    setPendingKey(item.key);
    setNotice("");
    try {
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key: item.key }),
      });
      const data = await response.json().catch(() => null) as { key?: string; count?: number; liked?: boolean } | null;
      if (!response.ok || data?.key !== item.key || typeof data.count !== "number" || typeof data.liked !== "boolean") {
        if (response.status === 401) offerMemberLogin();
        throw new Error(response.status === 401 ? "로그인 후 좋아요를 누를 수 있습니다." : "좋아요를 저장하지 못했습니다.");
      }
      setItems((current) => current.map((entry) => entry.key === item.key ? { ...entry, likeCount: data.count!, liked: data.liked! } : entry));
      window.dispatchEvent(new CustomEvent("amaon:likes-changed", { detail: data }));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "연결을 확인해 주세요.");
    } finally {
      setPendingKey(null);
    }
  }

  if (!open) return null;
  return <section className="global-video-feed" role="dialog" aria-modal="true" aria-label="아마온 전체 영상 피드">
    <header className="global-video-feed-header">
      <div><small>AMAON FILM FEED</small><strong>전체 영상</strong></div>
      <span>{items.length ? `${activeIndex + 1} / ${items.length}${cursor ? "+" : ""}` : ""}</span>
      <button type="button" onClick={onClose} aria-label="전체 영상 닫기">×</button>
    </header>
    <div className="global-video-feed-viewport" ref={viewportRef}>
      {items.map((item, index) => {
        const match = findPlayer(item);
        return <article className="global-video-feed-slide" data-feed-slide data-index={index} key={item.key}>
          <div className="global-video-feed-media">
            {index === activeIndex
              ? item.source === "youtube" && item.videoId
                ? <iframe src={youtubeEmbedUrl(item.videoId, true)} title={`${match?.player.name || "선수"} ${labels[item.category]}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                : <video src={item.url} controls autoPlay muted loop playsInline preload="metadata" />
              : item.thumbnailUrl
                ? <img src={item.thumbnailUrl} alt="다음 영상 미리보기" loading={Math.abs(index - activeIndex) <= 2 ? "eager" : "lazy"} />
                : <div className="global-video-feed-placeholder">▶</div>}
          </div>
          <div className="global-video-feed-meta">
            <small>{match?.school || "아마ON"} · {labels[item.category]}</small>
            <strong>{match ? <><em>{match.player.number}</em> {match.player.name}</> : "등록 선수 영상"}</strong>
            {match && <span>{match.player.position} · {match.player.grade}</span>}
            <div>
              <button type="button" className={item.liked ? "liked" : ""} onClick={() => void toggleLike(item)} disabled={pendingKey !== null} aria-pressed={item.liked}>♥ {pendingKey === item.key ? "…" : item.likeCount}</button>
              {match && onOpenPlayer && <button type="button" onClick={() => { onClose(); onOpenPlayer(match); }}>선수 프로필</button>}
            </div>
          </div>
        </article>;
      })}
      {!items.length && <div className="global-video-feed-empty">{loading ? "영상을 준비하고 있습니다…" : notice || "등록된 공개 영상이 없습니다."}</div>}
      {items.length > 0 && loading && <div className="global-video-feed-loading">다음 영상을 불러오는 중…</div>}
    </div>
    {notice && items.length > 0 && <p className="global-video-feed-notice" role="status">{notice}</p>}
    <nav className="global-video-feed-nav" aria-label="영상 이동">
      <button type="button" onClick={() => scrollTo(activeIndex - 1)} disabled={activeIndex === 0} aria-label="이전 영상">↑</button>
      <button type="button" onClick={() => scrollTo(activeIndex + 1)} disabled={activeIndex >= items.length - 1 && !cursor} aria-label="다음 영상">↓</button>
    </nav>
  </section>;
}
