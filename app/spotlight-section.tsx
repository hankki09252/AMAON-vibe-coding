"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { PlayerSpotlight } from "./spotlight-data";
import { parseSpotlightUrl } from "./spotlight-url";
import type { WeeklyPlayerOption } from "./weekly-admin";
import styles from "./spotlight-section.module.css";

type AdminRow = {
  id: string; team_id: string; player_id: string; player_name: string; school_name: string;
  post_url: string; platform: "instagram" | "threads" | "blog"; title: string;
  summary: string; published: boolean; sort_order: number;
};
const emptyForm = { id: "", playerKey: "", postUrl: "", title: "", summary: "", published: true, sortOrder: "0" };
const platformLabel = { instagram: "INSTAGRAM", threads: "THREADS", blog: "BLOG" };

export default function SpotlightSection({ items, isAdmin, playerOptions }: {
  items: PlayerSpotlight[]; isAdmin: boolean; playerOptions: WeeklyPlayerOption[];
}) {
  const router = useRouter();
  const [active, setActive] = useState<PlayerSpotlight | null>(null);
  const [adminRows, setAdminRows] = useState<AdminRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const sortedPlayers = useMemo(() => [...playerOptions].sort((a, b) => `${a.school}${a.name}`.localeCompare(`${b.school}${b.name}`, "ko")), [playerOptions]);
  const platform = parseSpotlightUrl(form.postUrl)?.platform;

  const loadAdmin = useCallback(async () => {
    const response = await fetch("/api/spotlights", { cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (response.ok) setAdminRows(data.items || []);
    else setNotice(data.error || "등록 목록을 불러오지 못했습니다.");
  }, []);
  useEffect(() => {
    if (!isAdmin) return;
    const timer = window.setTimeout(() => void loadAdmin(), 0);
    return () => window.clearTimeout(timer);
  }, [isAdmin, loadAdmin]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const player = playerOptions.find((item) => `${item.teamId}|${item.playerId}` === form.playerKey);
    if (!player || !platform) return setNotice("선수와 지원되는 게시물 링크를 확인해 주세요.");
    setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/spotlights", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: form.id, teamId: player.teamId, playerId: player.playerId, playerName: player.name,
          schoolName: player.school, postUrl: form.postUrl, title: form.title, summary: form.summary,
          published: form.published, sortOrder: Number(form.sortOrder) }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return setNotice(data.error || "게시물을 저장하지 못했습니다.");
      setForm(emptyForm); setNotice("저장했습니다. 공개 글은 홈에 표시됩니다.");
      await loadAdmin(); router.refresh();
    } catch { setNotice("연결 상태를 확인한 뒤 다시 시도해 주세요."); }
    finally { setBusy(false); }
  }

  async function remove(id: string) {
    if (!window.confirm("이 연결을 삭제할까요? 원본 게시물은 삭제되지 않습니다.")) return;
    setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/spotlights", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return setNotice(data.error || "삭제하지 못했습니다.");
      if (form.id === id) setForm(emptyForm);
      await loadAdmin(); router.refresh();
      setNotice("연결을 삭제했습니다.");
    } catch { setNotice("연결 상태를 확인한 뒤 다시 시도해 주세요."); }
    finally { setBusy(false); }
  }

  return <section id="spotlight" className={styles.section} aria-labelledby="spotlight-title">
    <header className={styles.header}>
      <div><small>PLAYER STORIES · AROUND AMAON</small><h2 id="spotlight-title">이 선수 어때?</h2><p>숫자 너머의 플레이와 이야기를 만나보세요.</p></div>
      {isAdmin && <a href="#spotlight-editor">게시물 등록 →</a>}
    </header>
    {items.length > 0 && <div className={styles.cards}>{items.map((item) => <article className={styles.card} key={item.id}>
      <span className={styles.platform}>{platformLabel[item.platform]}</span>
      <h3>{item.title}</h3>
      <p>{item.summary || `${item.playerName} 선수의 ${item.platform === "blog" ? "글" : "게시물"}을 확인해 보세요.`}</p>
      <span className={styles.player}>{item.schoolName} · {item.playerName}</span>
      <div className={styles.actions}>
        {item.platform === "instagram" && <button type="button" onClick={() => setActive(item)}>여기서 보기 ↗</button>}
        <a href={item.postUrl} target="_blank" rel="noopener noreferrer">원문 보기 ↗</a>
        <a href={`/?team=${encodeURIComponent(item.teamId)}&player=${encodeURIComponent(item.playerId)}`}>선수 프로필 →</a>
      </div>
    </article>)}</div>}
    {isAdmin && <div id="spotlight-editor" className={styles.editor}>
      <div className={styles.editorIntro}><small>OPERATOR ONLY</small><h3>선수 이야기 연결</h3><p>공개 선수와 게시물 링크를 선택하세요. 제목·소개는 비워도 됩니다. 게시물 자체는 원래 플랫폼에서 관리됩니다.</p></div>
      <form onSubmit={save} className={styles.form}>
        <label>선수 <select value={form.playerKey} required onChange={(event) => setForm({ ...form, playerKey: event.target.value })}>
          <option value="">선수를 선택해 주세요</option>{sortedPlayers.map((player) => <option key={`${player.teamId}|${player.playerId}`} value={`${player.teamId}|${player.playerId}`}>{player.school} · {player.name} · {player.position}</option>)}
        </select></label>
        <label>게시물 링크 <input type="url" value={form.postUrl} onChange={(event) => setForm({ ...form, postUrl: event.target.value })} placeholder="https://www.instagram.com/reel/..." required /></label>
        <p className={styles.hint}>인스타그램 게시물·릴스, 스레드 게시물, 네이버 블로그·티스토리 글을 지원합니다. {platform && <b>{platformLabel[platform]} 링크 확인됨</b>}</p>
        <label>제목 <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} maxLength={120} placeholder="비워두면 ‘선수 이름의 이야기’로 표시" /></label>
        <label>짧은 소개 <textarea value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} maxLength={240} rows={2} placeholder="게시물에 대한 한두 문장 (선택)" /></label>
        <div className={styles.formBottom}><label className={styles.check}><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} />지금 공개하기</label>
          <label className={styles.order}>순서 <input type="number" min={0} max={999} value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} /></label></div>
        <div className={styles.formActions}><button type="submit" disabled={busy || !platform}>{busy ? "저장 중…" : form.id ? "수정 저장" : "게시물 연결"}</button>{form.id && <button type="button" onClick={() => setForm(emptyForm)}>새로 작성</button>}</div>
        {notice && <p role="status" className={styles.notice}>{notice}</p>}
      </form>
      {adminRows.length > 0 && <div className={styles.adminList}><h4>등록한 링크</h4>{adminRows.map((row) => <div key={row.id} className={styles.adminRow}>
        <div><small>{row.published ? "공개" : "비공개"} · {platformLabel[row.platform]}</small><strong>{row.title}</strong><span>{row.school_name} · {row.player_name}</span></div>
        <div><button type="button" disabled={busy} onClick={() => { setForm({ id: row.id, playerKey: `${row.team_id}|${row.player_id}`, postUrl: row.post_url, title: row.title, summary: row.summary, published: row.published, sortOrder: String(row.sort_order) }); document.getElementById("spotlight-editor")?.scrollIntoView({ behavior: "smooth" }); }}>수정</button><button type="button" disabled={busy} onClick={() => void remove(row.id)}>삭제</button></div>
      </div>)}</div>}
    </div>}
    {active && <div className={styles.backdrop}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="spotlight-embed-title"><header><h3 id="spotlight-embed-title">{active.playerName} 선수의 게시물</h3><button type="button" onClick={() => setActive(null)} aria-label="게시물 닫기">×</button></header>
        <iframe title={`${active.playerName} 선수의 인스타그램 게시물`} src={`${active.postUrl}embed/`} loading="lazy" allow="encrypted-media" />
        <a href={active.postUrl} target="_blank" rel="noopener noreferrer">게시물이 보이지 않나요? 인스타그램에서 보기 ↗</a>
      </div>
    </div>}
  </section>;
}
