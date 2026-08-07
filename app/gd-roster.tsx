"use client";

import { ChangeEvent, CSSProperties, useEffect, useMemo, useState } from "react";

type GdPlayer = {
  id: string;
  number: string;
  name: string;
  position: string;
  grade: string;
  height: number;
  weight: number;
  batsThrows: string;
  sourcePhoto?: { x: number; y: number };
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

const mediaCategories: Array<{ id: MediaCategory; label: string; shortLabel: string }> = [
  { id: "photo", label: "사진", shortLabel: "PHOTO" },
  { id: "batting", label: "타격영상", shortLabel: "BATTING" },
  { id: "fielding", label: "수비영상", shortLabel: "FIELDING" },
  { id: "pitching", label: "투구영상", shortLabel: "PITCHING" },
];

const gdPlayers: GdPlayer[] = [
  { id: "13", number: "13", name: "기재혁", position: "외야수", grade: "1학년", height: 182, weight: 80, batsThrows: "우투우타" },
  { id: "21", number: "21", name: "김건수", position: "투수", grade: "2학년", height: 187, weight: 92, batsThrows: "좌투좌타" },
  { id: "28", number: "28", name: "김재준", position: "투수", grade: "3학년", height: 175, weight: 82, batsThrows: "우투우타", sourcePhoto: { x: 2, y: 264 } },
  { id: "7", number: "7", name: "김태양", position: "외야수", grade: "3학년", height: 165, weight: 65, batsThrows: "우투우타", sourcePhoto: { x: 374, y: 264 } },
  { id: "17", number: "17", name: "나하람", position: "투수", grade: "2학년", height: 181, weight: 84, batsThrows: "우투우타" },
  { id: "9", number: "9", name: "배석민", position: "내야수", grade: "3학년", height: 176, weight: 70, batsThrows: "우투좌타", sourcePhoto: { x: 1117, y: 264 } },
  { id: "23", number: "23", name: "서무혁", position: "외야수", grade: "2학년", height: 181, weight: 78, batsThrows: "우투우타" },
  { id: "10", number: "10", name: "손주환", position: "내야수", grade: "2학년", height: 175, weight: 75, batsThrows: "우투우타", sourcePhoto: { x: 2, y: 521 } },
  { id: "18", number: "18", name: "신지원", position: "투수", grade: "3학년", height: 187, weight: 92, batsThrows: "우투우타" },
  { id: "11", number: "11", name: "안장근", position: "투수", grade: "2학년", height: 184, weight: 84, batsThrows: "우투우타", sourcePhoto: { x: 745, y: 521 } },
  { id: "40", number: "40", name: "용거련", position: "투수", grade: "1학년", height: 176, weight: 80, batsThrows: "우투우타" },
  { id: "5", number: "5", name: "윤도현", position: "포수", grade: "3학년", height: 184, weight: 85, batsThrows: "우투우타" },
  { id: "36", number: "36", name: "윤현중", position: "외야수", grade: "3학년", height: 175, weight: 73, batsThrows: "우투우타", sourcePhoto: { x: 2, y: 777 } },
  { id: "16", number: "16", name: "이주영", position: "내야수", grade: "2학년", height: 175, weight: 70, batsThrows: "우투우타", sourcePhoto: { x: 374, y: 777 } },
  { id: "1", number: "1", name: "임명훈", position: "투수", grade: "3학년", height: 175, weight: 75, batsThrows: "우투우타", sourcePhoto: { x: 745, y: 777 } },
  { id: "32", number: "32", name: "정건우", position: "포수", grade: "2학년", height: 178, weight: 82, batsThrows: "우투우타" },
  { id: "19", number: "19", name: "조이준", position: "투수", grade: "3학년", height: 189, weight: 106, batsThrows: "우투우타" },
  { id: "25", number: "25", name: "최규호", position: "미지정", grade: "2학년", height: 184, weight: 88, batsThrows: "우투우타" },
  { id: "2", number: "2", name: "최승호", position: "내야수", grade: "2학년", height: 174, weight: 61, batsThrows: "우투우타" },
  { id: "12", number: "12", name: "최효범", position: "포수", grade: "2학년", height: 180, weight: 80, batsThrows: "우투우타", sourcePhoto: { x: 745, y: 1035 } },
];

function ReferencePhoto({ player }: { player: GdPlayer }) {
  if (!player.sourcePhoto) return null;
  const style = {
    "--photo-left": `${-(player.sourcePhoto.x / 173) * 100}%`,
    "--photo-top": `${-(player.sourcePhoto.y / 225) * 100}%`,
  } as CSSProperties;
  return <span className="gd-source-photo" style={style}><img src="/gd-roster-reference.png" alt={`${player.name} 선수`} /></span>;
}

export default function GdRoster() {
  const [selected, setSelected] = useState<GdPlayer | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory>("photo");

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

  useEffect(() => { void loadMedia(); }, []);

  const mediaByPlayer = useMemo(() => {
    const grouped = new Map<string, MediaItem[]>();
    media.forEach((item) => grouped.set(item.playerId, [...(grouped.get(item.playerId) ?? []), item]));
    return grouped;
  }, [media]);

  async function uploadFiles(event: ChangeEvent<HTMLInputElement>) {
    if (!selected || !event.target.files?.length) return;
    const files = Array.from(event.target.files).slice(0, 10);
    setUploading(true);
    setNotice("");

    try {
      for (const file of files) {
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
      event.target.value = "";
    }
  }

  const selectedMedia = selected ? mediaByPlayer.get(selected.id) ?? [] : [];
  const selectedCategoryMedia = selectedMedia.filter((item) => item.category === selectedCategory);
  const activeCategory = mediaCategories.find((category) => category.id === selectedCategory) ?? mediaCategories[0];

  return (
    <section className="gd-section" id="gd-roster">
      <div className="gd-heading">
        <div>
          <p className="kicker"><span /> GD CHALLENGERS · U-18</p>
          <h2>GD챌린저스 선수단</h2>
          <p>2026 등록 선수 20명 · 감독 송구홍</p>
        </div>
        <div className="gd-summary"><strong>20</strong><span>PLAYER PROFILES</span></div>
      </div>

      <div className="gd-grid">
        {gdPlayers.map((player) => {
          const playerMedia = mediaByPlayer.get(player.id) ?? [];
          const portrait = playerMedia.find((item) => item.type === "image");
          return (
            <button className="gd-card" key={player.id} onClick={() => { setSelected(player); setSelectedCategory("photo"); setNotice(""); }}>
              <div className="gd-portrait">
                {portrait ? <img className="gd-uploaded-portrait" src={portrait.url} alt={`${player.name} 선수`} /> : player.sourcePhoto ? <ReferencePhoto player={player} /> : <span className="gd-jersey-placeholder" aria-hidden="true"><b>{player.number}</b><i>GD</i></span>}
                <small>{playerMedia.length ? `MEDIA ${playerMedia.length}` : "PHOTO READY"}</small>
              </div>
              <div className="gd-card-info">
                <p>{player.position} · {player.grade}</p>
                <h3><em>{player.number}.</em> {player.name}</h3>
                <dl><div><dt>신체</dt><dd>{player.height}cm / {player.weight}kg</dd></div><div><dt>투타</dt><dd>{player.batsThrows}</dd></div></dl>
                <span>프로필 열기 ↗</span>
              </div>
            </button>
          );
        })}
      </div>
      {loading && <p className="gd-loading">업로드된 사진과 영상을 확인하고 있습니다.</p>}

      {selected && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelected(null)}>
          <section className="gd-modal" role="dialog" aria-modal="true" aria-label={`${selected.name} 선수 프로필`} onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)} aria-label="닫기">×</button>
            <div className="gd-modal-head">
              <div className="gd-modal-number">{selected.number}</div>
              <div><p>GD CHALLENGERS · 2026</p><h2>{selected.name}</h2><strong>{selected.position} · {selected.grade}</strong></div>
            </div>
            <div className="gd-profile-stats">
              <div><span>HEIGHT</span><strong>{selected.height}<small>cm</small></strong></div>
              <div><span>WEIGHT</span><strong>{selected.weight}<small>kg</small></strong></div>
              <div><span>THROW / BAT</span><strong>{selected.batsThrows}</strong></div>
            </div>

            <div className="gd-media-head"><div><h3>사진 · 경기 영상</h3><p>카테고리를 선택하면 해당 항목만 모아서 볼 수 있습니다.</p></div><label className={uploading ? "disabled" : ""}><input type="file" accept={selectedCategory === "photo" ? "image/jpeg,image/png,image/webp" : "video/mp4,video/webm,video/quicktime"} multiple onChange={uploadFiles} disabled={uploading} /><span>{uploading ? "업로드 중…" : `+ ${activeCategory.label} 올리기`}</span></label></div>
            <div className="gd-media-categories" aria-label="미디어 카테고리">
              {mediaCategories.map((category) => (
                <button key={category.id} className={selectedCategory === category.id ? "active" : ""} onClick={() => { setSelectedCategory(category.id); setNotice(""); }}>
                  <span>{category.label}</span><small>{selectedMedia.filter((item) => item.category === category.id).length}</small>
                </button>
              ))}
            </div>
            {notice && <p className="gd-notice">{notice}</p>}
            <div className="gd-media-grid">
              {selectedCategoryMedia.map((item) => <figure key={item.key}>{item.type === "image" ? <img src={item.url} alt={`${selected.name} 업로드 사진`} /> : <video src={item.url} controls preload="metadata" />}<figcaption>{activeCategory.shortLabel}</figcaption></figure>)}
              {!selectedCategoryMedia.length && <div className="gd-media-empty"><span>＋</span><strong>아직 등록된 {activeCategory.label}이 없습니다.</strong><p>{selectedCategory === "photo" ? "JPG·PNG·WEBP 사진을 올려주세요." : "MP4·WEBM·MOV 영상을 올려주세요."}</p></div>}
            </div>
            <p className="gd-rights">선수·보호자 동의와 촬영물 사용 권리가 확인된 파일만 올려주세요. 파일당 최대 100MB입니다.</p>
          </section>
        </div>
      )}
    </section>
  );
}
