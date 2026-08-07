"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";

export type TeamPlayer = {
  id: string;
  number: string;
  name: string;
  position: string;
  grade: string;
  height: number;
  weight: number;
  batsThrows: string;
};

type MediaItem = {
  key: string;
  playerId: string;
  type: "image" | "video";
  contentType: string;
  url: string;
  uploadedAt: string;
  category: MediaCategory;
};

type MediaCategory = "pitching" | "batting" | "fielding" | "photo";
type LikeState = { count: number; liked: boolean };

const mediaCategories: Array<{ id: MediaCategory; label: string; shortLabel: string }> = [
  { id: "photo", label: "사진", shortLabel: "PHOTO" },
  { id: "batting", label: "타격영상", shortLabel: "BATTING" },
  { id: "fielding", label: "수비영상", shortLabel: "FIELDING" },
  { id: "pitching", label: "투구영상", shortLabel: "PITCHING" },
];

const gdPlayers: TeamPlayer[] = [
  { id: "13", number: "13", name: "기재혁", position: "외야수", grade: "1학년", height: 182, weight: 80, batsThrows: "우투우타" },
  { id: "21", number: "21", name: "김건수", position: "투수", grade: "2학년", height: 187, weight: 92, batsThrows: "좌투좌타" },
  { id: "28", number: "28", name: "김재준", position: "투수", grade: "3학년", height: 175, weight: 82, batsThrows: "우투우타" },
  { id: "7", number: "7", name: "김태양", position: "외야수", grade: "3학년", height: 165, weight: 65, batsThrows: "우투우타" },
  { id: "17", number: "17", name: "나하람", position: "투수", grade: "2학년", height: 181, weight: 84, batsThrows: "우투우타" },
  { id: "9", number: "9", name: "배석민", position: "내야수", grade: "3학년", height: 176, weight: 70, batsThrows: "우투좌타" },
  { id: "23", number: "23", name: "서무혁", position: "외야수", grade: "2학년", height: 181, weight: 78, batsThrows: "우투우타" },
  { id: "10", number: "10", name: "손주환", position: "내야수", grade: "2학년", height: 175, weight: 75, batsThrows: "우투우타" },
  { id: "18", number: "18", name: "신지원", position: "투수", grade: "3학년", height: 187, weight: 92, batsThrows: "우투우타" },
  { id: "11", number: "11", name: "안장근", position: "투수", grade: "2학년", height: 184, weight: 84, batsThrows: "우투우타" },
  { id: "40", number: "40", name: "용거련", position: "투수", grade: "1학년", height: 176, weight: 80, batsThrows: "우투우타" },
  { id: "5", number: "5", name: "윤도현", position: "포수", grade: "3학년", height: 184, weight: 85, batsThrows: "우투우타" },
  { id: "36", number: "36", name: "윤현중", position: "외야수", grade: "3학년", height: 175, weight: 73, batsThrows: "우투우타" },
  { id: "16", number: "16", name: "이주영", position: "내야수", grade: "2학년", height: 175, weight: 70, batsThrows: "우투우타" },
  { id: "1", number: "1", name: "임명훈", position: "투수", grade: "3학년", height: 175, weight: 75, batsThrows: "우투우타" },
  { id: "32", number: "32", name: "정건우", position: "포수", grade: "2학년", height: 178, weight: 82, batsThrows: "우투우타" },
  { id: "19", number: "19", name: "조이준", position: "투수", grade: "3학년", height: 189, weight: 106, batsThrows: "우투우타" },
  { id: "25", number: "25", name: "최규호", position: "미지정", grade: "2학년", height: 184, weight: 88, batsThrows: "우투우타" },
  { id: "2", number: "2", name: "최승호", position: "내야수", grade: "2학년", height: 174, weight: 61, batsThrows: "우투우타" },
  { id: "12", number: "12", name: "최효범", position: "포수", grade: "2학년", height: 180, weight: 80, batsThrows: "우투우타" },
];

type TeamRosterProps = {
  sectionId: string;
  kicker: string;
  title: string;
  subtitle: string;
  teamLabel: string;
  monogram: string;
  players: TeamPlayer[];
};

export function TeamRoster({ sectionId, kicker, title, subtitle, teamLabel, monogram, players }: TeamRosterProps) {
  const [selected, setSelected] = useState<TeamPlayer | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadingPlayerId, setUploadingPlayerId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory>("photo");
  const [likes, setLikes] = useState<Record<string, LikeState>>({});
  const [isAdmin, setIsAdmin] = useState(false);

  function getProfileUrl(player: TeamPlayer) {
    const url = new URL(window.location.origin);
    url.searchParams.set("team", sectionId);
    url.searchParams.set("player", player.id);
    url.hash = sectionId;
    return url.toString();
  }

  function openPlayer(player: TeamPlayer) {
    setSelected(player);
    setSelectedCategory("photo");
    setNotice("");
    window.history.replaceState(null, "", getProfileUrl(player));
  }

  function closePlayer() {
    setSelected(null);
    const url = new URL(window.location.href);
    if (url.searchParams.get("team") === sectionId) {
      url.searchParams.delete("team");
      url.searchParams.delete("player");
      url.hash = sectionId;
      window.history.replaceState(null, "", url);
    }
  }

  async function copyProfileLink() {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(getProfileUrl(selected));
      setNotice("선수 프로필 링크를 복사했습니다. 인스타그램 프로필에 붙여 넣어주세요.");
    } catch {
      setNotice("링크를 복사하지 못했습니다. 주소창의 링크를 직접 복사해 주세요.");
    }
  }

  async function loadMedia() {
    setLoading(true);
    try {
      const response = await fetch("/api/media", { cache: "no-store" });
      if (!response.ok) throw new Error("미디어를 불러오지 못했습니다.");
      const data = await response.json() as { items: MediaItem[] };
      setMedia(data.items);
    } catch {
      setNotice("업로드된 미디어를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  async function loadLikes() {
    try {
      const response = await fetch("/api/likes", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json() as { items: Array<{ key: string; count: number; liked: boolean }> };
      setLikes(Object.fromEntries(data.items.map((item) => [item.key, { count: item.count, liked: item.liked }])));
    } catch {
      // Likes are optional display data; media remains available if this request fails.
    }
  }

  async function loadAdminAccess() {
    try {
      const response = await fetch("/api/admin", { cache: "no-store" });
      const data = await response.json() as { isAdmin?: boolean };
      setIsAdmin(Boolean(response.ok && data.isAdmin));
    } catch {
      setIsAdmin(false);
    }
  }

  useEffect(() => {
    void loadMedia();
    void loadLikes();
    void loadAdminAccess();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("team") !== sectionId) return;
    const linkedPlayer = players.find((player) => player.id === params.get("player"));
    if (linkedPlayer) {
      setSelected(linkedPlayer);
      setSelectedCategory("photo");
    }
  }, [players, sectionId]);

  const mediaByPlayer = useMemo(() => {
    const grouped = new Map<string, MediaItem[]>();
    media.forEach((item) => grouped.set(item.playerId, [...(grouped.get(item.playerId) ?? []), item]));
    return grouped;
  }, [media]);

  async function uploadMultipartVideo(file: File, playerId: string, category: MediaCategory) {
    const chunkSize = 50 * 1024 * 1024;
    const maxVideoSize = 2 * 1024 * 1024 * 1024;
    if (file.size > maxVideoSize) throw new Error("영상은 최대 2GB까지 올릴 수 있습니다.");
    const contentType = file.type || (file.name.toLowerCase().endsWith(".mov") ? "video/quicktime" : "video/mp4");
    let key = "";
    let uploadId = "";

    try {
      const createResponse = await fetch("/api/media?action=multipart-create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ playerId, category, fileName: file.name, contentType, size: file.size }),
      });
      const created = await createResponse.json().catch(() => null) as { key?: string; uploadId?: string; error?: string } | null;
      if (!createResponse.ok || !created?.key || !created.uploadId) throw new Error(created?.error ?? "대용량 영상 업로드를 시작하지 못했습니다.");
      key = created.key;
      uploadId = created.uploadId;

      const parts: Array<{ partNumber: number; etag: string }> = [];
      const partCount = Math.ceil(file.size / chunkSize);
      for (let index = 0; index < partCount; index += 1) {
        const start = index * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        let uploadedPart: { partNumber: number; etag: string } | null = null;

        for (let attempt = 1; attempt <= 3 && !uploadedPart; attempt += 1) {
          const partResponse = await fetch(`/api/media?action=multipart-part&key=${encodeURIComponent(key)}&uploadId=${encodeURIComponent(uploadId)}&partNumber=${index + 1}`, {
            method: "PUT",
            headers: { "content-type": "application/octet-stream" },
            body: chunk,
          });
          const partData = await partResponse.json().catch(() => null) as { partNumber?: number; etag?: string; error?: string } | null;
          if (partResponse.ok && partData?.partNumber && partData.etag) uploadedPart = { partNumber: partData.partNumber, etag: partData.etag };
          else if (attempt === 3) throw new Error(partData?.error ?? `${index + 1}번째 영상 전송에 실패했습니다.`);
        }

        parts.push(uploadedPart as { partNumber: number; etag: string });
        setUploadProgress(Math.round((end / file.size) * 95));
      }

      const completeResponse = await fetch("/api/media?action=multipart-complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key, uploadId, parts }),
      });
      const completed = await completeResponse.json().catch(() => null) as { error?: string } | null;
      if (!completeResponse.ok) throw new Error(completed?.error ?? "전송된 영상을 합치지 못했습니다.");
      setUploadProgress(100);
    } catch (error) {
      if (key && uploadId) {
        void fetch(`/api/media?action=multipart-abort&key=${encodeURIComponent(key)}&uploadId=${encodeURIComponent(uploadId)}`, { method: "DELETE" });
      }
      throw error;
    }
  }

  async function uploadFiles(event: ChangeEvent<HTMLInputElement>) {
    if (!selected || !event.target.files?.length) return;
    const files = Array.from(event.target.files).slice(0, 10);
    setUploading(true);
    setUploadProgress(null);
    setNotice("");

    try {
      for (const file of files) {
        const isVideo = file.type.startsWith("video/") || /\.(mp4|mov|webm)$/i.test(file.name);
        if (selectedCategory !== "photo" && isVideo) {
          setUploadProgress(0);
          await uploadMultipartVideo(file, selected.id, selectedCategory);
          continue;
        }
        const form = new FormData();
        form.append("playerId", selected.id);
        form.append("category", selectedCategory);
        form.append("file", file);
        const response = await fetch("/api/media", { method: "POST", body: form });
        if (!response.ok) {
          const data = await response.json().catch(() => null) as { error?: string } | null;
          throw new Error(data?.error ?? `${file.name} 업로드에 실패했습니다.`);
        }
      }
      const categoryLabel = mediaCategories.find((category) => category.id === selectedCategory)?.label;
      setNotice(`${categoryLabel}에 ${files.length}개 파일을 업로드했습니다.`);
      await loadMedia();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
      setUploadProgress(null);
      event.target.value = "";
    }
  }

  async function uploadPlayerPhoto(player: TeamPlayer, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingPlayerId(player.id);
    setNotice("");

    try {
      const form = new FormData();
      form.append("playerId", player.id);
      form.append("category", "photo");
      form.append("file", file);
      const response = await fetch("/api/media", { method: "POST", body: form });
      if (!response.ok) {
        const data = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(data?.error ?? `${file.name} 업로드에 실패했습니다.`);
      }
      await loadMedia();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "사진 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploadingPlayerId(null);
      event.target.value = "";
    }
  }

  async function toggleLike(item: MediaItem) {
    const response = await fetch("/api/likes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key: item.key }),
    });
    if (!response.ok) return;
    const data = await response.json() as { key: string; count: number; liked: boolean };
    setLikes((current) => ({ ...current, [data.key]: { count: data.count, liked: data.liked } }));
  }

  async function deleteMedia(item: MediaItem) {
    if (!window.confirm("이 사진 또는 영상을 삭제할까요? 삭제하면 복구할 수 없습니다.")) return;
    const response = await fetch(`/api/media?action=delete&key=${encodeURIComponent(item.key)}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => null) as { error?: string } | null;
      setNotice(data?.error ?? "삭제하지 못했습니다.");
      return;
    }
    setMedia((current) => current.filter((mediaItem) => mediaItem.key !== item.key));
    setNotice("사진 또는 영상을 삭제했습니다.");
  }

  const selectedMedia = selected ? mediaByPlayer.get(selected.id) ?? [] : [];
  const selectedCategoryMedia = selectedMedia.filter((item) => item.category === selectedCategory);
  const activeCategory = mediaCategories.find((category) => category.id === selectedCategory) ?? mediaCategories[0];

  return (
    <section className="gd-section" id={sectionId}>
      <div className="gd-heading">
        <div>
          <p className="kicker"><span /> {kicker}</p>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className="gd-summary"><strong>{players.length}</strong><span>PLAYER PROFILES</span></div>
      </div>

      <div className="gd-grid">
        {players.map((player) => {
          const playerMedia = mediaByPlayer.get(player.id) ?? [];
          const portrait = playerMedia
            .filter((item) => item.type === "image" && item.category === "photo")
            .sort((a, b) => Date.parse(b.uploadedAt) - Date.parse(a.uploadedAt))[0];
          return (
            <article className="gd-card" key={player.id}>
              <button className="gd-card-main" onClick={() => openPlayer(player)}>
                <div className="gd-portrait">
                  {portrait ? <img className="gd-uploaded-portrait" src={portrait.url} alt={`${player.name} 선수`} /> : <span className="gd-jersey-placeholder" aria-hidden="true"><b>{player.number}</b><i>{monogram}</i></span>}
                  <small>{playerMedia.length ? `MEDIA ${playerMedia.length}` : "PHOTO READY"}</small>
                </div>
                <div className="gd-card-info">
                  <p>{player.position} · {player.grade}</p>
                  <h3><em>{player.number}.</em> {player.name}</h3>
                  <dl><div><dt>신체</dt><dd>{player.height}cm / {player.weight}kg</dd></div><div><dt>투타</dt><dd>{player.batsThrows}</dd></div></dl>
                  <span>프로필 열기 ↗</span>
                </div>
              </button>
              {isAdmin && <label className={`gd-card-upload${uploadingPlayerId === player.id ? " disabled" : ""}`}>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void uploadPlayerPhoto(player, event)} disabled={uploadingPlayerId !== null} />
                <span>{uploadingPlayerId === player.id ? "사진 올리는 중…" : portrait ? "사진 교체하기" : "+ 선수 사진 직접 올리기"}</span>
              </label>}
            </article>
          );
        })}
      </div>
      {loading && <p className="gd-loading">업로드된 사진과 영상을 확인하고 있습니다.</p>}

      {selected && (
        <div className="modal-backdrop" role="presentation" onMouseDown={closePlayer}>
          <section className="gd-modal" role="dialog" aria-modal="true" aria-label={`${selected.name} 선수 프로필`} onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={closePlayer} aria-label="닫기">×</button>
            <div className="gd-modal-head">
              <div className="gd-modal-number">{selected.number}</div>
              <div className="gd-modal-identity"><p>{teamLabel} · 2026</p><h2>{selected.name}</h2><strong>{selected.position} · {selected.grade}</strong><button className="gd-share-link" onClick={() => void copyProfileLink()}>프로필 링크 복사</button></div>
            </div>
            <div className="gd-profile-stats">
              <div><span>HEIGHT</span><strong>{selected.height}<small>cm</small></strong></div>
              <div><span>WEIGHT</span><strong>{selected.weight}<small>kg</small></strong></div>
              <div><span>THROW / BAT</span><strong>{selected.batsThrows}</strong></div>
            </div>

            <div className="gd-media-head"><div><h3>사진 · 경기 영상</h3><p>카테고리를 선택하면 해당 항목만 모아서 볼 수 있습니다.</p></div>{isAdmin ? <label className={uploading ? "disabled" : ""}><input type="file" accept={selectedCategory === "photo" ? "image/jpeg,image/png,image/webp" : "video/mp4,video/webm,video/quicktime"} multiple onChange={uploadFiles} disabled={uploading} /><span>{uploading ? `업로드 중${uploadProgress === null ? "…" : ` ${uploadProgress}%`}` : `+ ${activeCategory.label} 올리기`}</span></label> : <span className="gd-admin-note">관리자만 업로드할 수 있습니다</span>}</div>
            <div className="gd-media-categories" aria-label="미디어 카테고리">
              {mediaCategories.map((category) => (
                <button key={category.id} className={selectedCategory === category.id ? "active" : ""} onClick={() => { setSelectedCategory(category.id); setNotice(""); }}>
                  <span>{category.label}</span><small>{selectedMedia.filter((item) => item.category === category.id).length}</small>
                </button>
              ))}
            </div>
            {notice && <p className="gd-notice">{notice}</p>}
            <div className="gd-media-grid">
              {selectedCategoryMedia.map((item) => {
                const like = likes[item.key] ?? { count: 0, liked: false };
                return <figure key={item.key}>{item.type === "image" ? <img src={item.url} alt={`${selected.name} 업로드 사진`} /> : <video src={item.url} controls preload="metadata" />}<figcaption>{activeCategory.shortLabel}</figcaption><div className="gd-media-actions"><button className={like.liked ? "liked" : ""} onClick={() => void toggleLike(item)} aria-label={like.liked ? "좋아요 취소" : "좋아요"}>♥ <span>{like.count}</span></button>{isAdmin && <button className="delete" onClick={() => void deleteMedia(item)}>삭제</button>}</div></figure>;
              })}
              {!selectedCategoryMedia.length && <div className="gd-media-empty"><span>＋</span><strong>아직 등록된 {activeCategory.label}이 없습니다.</strong><p>{selectedCategory === "photo" ? "JPG·PNG·WEBP 사진을 올려주세요." : "MP4·WEBM·MOV 영상을 올려주세요."}</p></div>}
            </div>
            <p className="gd-rights">선수·보호자 동의와 촬영물 사용 권리가 확인된 파일만 올려주세요. 사진은 100MB, 영상은 최대 2GB까지 올릴 수 있습니다.</p>
          </section>
        </div>
      )}
    </section>
  );
}

export default function GdRoster() {
  return <TeamRoster sectionId="gd-roster" kicker="GD CHALLENGERS · U-18" title="GD챌린저스 선수단" subtitle="2026 등록 선수 20명 · 감독 송구홍" teamLabel="GD CHALLENGERS" monogram="GD" players={gdPlayers} />;
}
