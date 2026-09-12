"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

export type WeeklyPlayerOption = { teamId: string; playerId: string; name: string; school: string; position: string };
type WeeklyRow = {
  id: string; issue_number: number; slug: string; title: string; summary: string; one_issue_title: string; body: string;
  on_message: string; cover_storage_key: string | null; coverUrl: string; team_id: string | null; player_id: string | null;
  player_name: string | null; school_name: string | null; position: string | null; published: boolean; updated_at: string;
};
type Stat = { pageViews: number; playerProfile: number; playerVideo: number; profileSubmission: number };
const empty = { id: "", issueNumber: "1", slug: "", title: "", summary: "", oneIssueTitle: "", body: "", onMessage: "지금 내 플레이를 정리해보세요.", playerKey: "", published: false, coverUrl: "" };

export default function WeeklyAdmin({ playerOptions }: { playerOptions: WeeklyPlayerOption[] }) {
  const [items, setItems] = useState<WeeklyRow[]>([]);
  const [stats, setStats] = useState<Record<string, Stat>>({});
  const [form, setForm] = useState(empty);
  const [cover, setCover] = useState<File | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const sortedPlayers = useMemo(() => [...playerOptions].sort((a, b) => `${a.school}${a.name}`.localeCompare(`${b.school}${b.name}`, "ko")), [playerOptions]);

  const load = useCallback(async () => {
    const [postResponse, statResponse] = await Promise.all([fetch("/api/weekly", { cache: "no-store" }), fetch("/api/weekly/events", { cache: "no-store" })]);
    const posts = await postResponse.json().catch(() => ({}));
    const report = await statResponse.json().catch(() => ({}));
    if (!postResponse.ok) return setNotice(posts.error || "WEEKLY 목록을 불러오지 못했습니다.");
    setItems(posts.items || []); setStats(report.stats || {});
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);

  function edit(row: WeeklyRow) {
    setForm({ id: row.id, issueNumber: String(row.issue_number), slug: row.slug, title: row.title, summary: row.summary,
      oneIssueTitle: row.one_issue_title, body: row.body, onMessage: row.on_message,
      playerKey: row.team_id && row.player_id ? `${row.team_id}|${row.player_id}` : "", published: row.published, coverUrl: row.coverUrl || "" });
    setCover(null); setNotice("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setNotice("");
    const player = sortedPlayers.find((item) => `${item.teamId}|${item.playerId}` === form.playerKey);
    const data = new FormData();
    Object.entries({ id: form.id, issueNumber: form.issueNumber, slug: form.slug, title: form.title, summary: form.summary,
      oneIssueTitle: form.oneIssueTitle, body: form.body, onMessage: form.onMessage, teamId: player?.teamId || "", playerId: player?.playerId || "",
      playerName: player?.name || "", schoolName: player?.school || "", position: player?.position || "", published: String(form.published) })
      .forEach(([key, value]) => data.set(key, value));
    if (cover) data.set("cover", cover);
    const response = await fetch("/api/weekly", { method: "POST", body: data });
    const payload = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) return setNotice(payload.error || "WEEKLY를 저장하지 못했습니다.");
    setNotice(form.published ? "WEEKLY를 공개했습니다." : "임시저장했습니다."); setForm(empty); setCover(null); await load();
  }

  return <section className="weekly-admin" aria-labelledby="weekly-admin-title">
    <div className="member-admin-heading"><div><h3 id="weekly-admin-title">AMAON WEEKLY 관리</h3><p>매주 한 편을 작성하고, 선수와 대표 이미지를 확인한 뒤 공개하세요.</p></div><a href="/weekly" target="_blank" rel="noreferrer">공개 화면 보기 ↗</a></div>
    <form className="weekly-admin-form" onSubmit={save}>
      <div className="weekly-admin-row"><label>회차<input type="number" min="1" max="999" required value={form.issueNumber} onChange={(e) => setForm({ ...form, issueNumber: e.target.value })} /></label><label>영문 주소<input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })} placeholder="offseason-baseball-player" /></label></div>
      <label>제목<input required minLength={2} maxLength={120} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
      <label>한 줄 요약<textarea required minLength={10} maxLength={240} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></label>
      <label>PLAYER · 이번 주 선수<select value={form.playerKey} onChange={(e) => setForm({ ...form, playerKey: e.target.value })}><option value="">임시저장 시 나중에 선택</option>{sortedPlayers.map((player) => <option key={`${player.teamId}-${player.playerId}`} value={`${player.teamId}|${player.playerId}`}>{player.school} · {player.name} · {player.position}</option>)}</select></label>
      <label>ONE ISSUE · 소제목<input required minLength={2} maxLength={100} value={form.oneIssueTitle} onChange={(e) => setForm({ ...form, oneIssueTitle: e.target.value })} /></label>
      <label>본문<textarea className="weekly-admin-body" required minLength={20} maxLength={5000} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="문단 사이를 한 줄 비워 작성하세요." /></label>
      <label>ON · 행동 문구<input required minLength={2} maxLength={160} value={form.onMessage} onChange={(e) => setForm({ ...form, onMessage: e.target.value })} /></label>
      <label>대표 이미지 (JPG·PNG·WEBP, 4MB 이하)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setCover(e.target.files?.[0] || null)} />{form.coverUrl && <small>현재 이미지 등록됨 · 새 파일을 고르면 교체됩니다.</small>}</label>
      <label className="weekly-admin-publish"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> 지금 공개하기</label>
      <div className="weekly-admin-buttons"><button disabled={busy}>{busy ? "저장 중…" : form.published ? "저장하고 공개" : "임시저장"}</button>{form.id && <button type="button" onClick={() => { setForm(empty); setCover(null); }}>새 글 작성</button>}</div>
      {notice && <p className="weekly-admin-notice" role="status">{notice}</p>}
    </form>
    <div className="weekly-admin-list">{items.map((row) => { const report = stats[row.id]; return <article key={row.id}>
      <div><small>#{String(row.issue_number).padStart(2, "0")} · {row.published ? "공개" : "임시저장"}</small><strong>{row.title}</strong><span>{row.school_name && row.player_name ? `${row.school_name} · ${row.player_name}` : "소개 선수 미선택"}</span></div>
      <p><b>{report?.pageViews || 0}</b> 조회 · 프로필 <b>{report?.playerProfile || 0}</b> · 영상 <b>{report?.playerVideo || 0}</b> · 등록 <b>{report?.profileSubmission || 0}</b></p>
      <button type="button" onClick={() => edit(row)}>수정</button>
    </article>; })}</div>
  </section>;
}
