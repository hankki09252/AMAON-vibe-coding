"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import imageStyles from "./weekly-admin-images.module.css";

export type WeeklyPlayerOption = { teamId: string; playerId: string; name: string; school: string; position: string };
type WeeklyRow = {
  id: string; issue_number: number; slug: string; title: string; summary: string; one_issue_title: string; body: string;
  on_message: string; cover_storage_key: string | null; coverUrl: string; team_id: string | null; player_id: string | null;
  player_name: string | null; school_name: string | null; position: string | null; published: boolean; updated_at: string;
};
type Stat = { pageViews: number; playerProfile: number; playerVideo: number; profileSubmission: number };
type ExistingImage = { id: string; imageUrl: string; caption: string; after_paragraph: number; sort_order: number };
type PendingImage = { key: string; file: File; caption: string; afterParagraph: number };
const empty = { id: "", issueNumber: "1", slug: "", title: "", summary: "", oneIssueTitle: "", body: "", onMessage: "지금 내 플레이를 정리해보세요.", playerKey: "", published: false, coverUrl: "" };

export default function WeeklyAdmin({ playerOptions }: { playerOptions: WeeklyPlayerOption[] }) {
  const [items, setItems] = useState<WeeklyRow[]>([]);
  const [stats, setStats] = useState<Record<string, Stat>>({});
  const [form, setForm] = useState(empty);
  const [cover, setCover] = useState<File | null>(null);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const sortedPlayers = useMemo(() => [...playerOptions].sort((a, b) => `${a.school}${a.name}`.localeCompare(`${b.school}${b.name}`, "ko")), [playerOptions]);
  const paragraphCount = useMemo(() => Math.max(1, form.body.split(/(?:\r?\n){2,}/).filter((item) => item.trim()).length), [form.body]);

  const load = useCallback(async () => {
    const [postResponse, statResponse] = await Promise.all([fetch("/api/weekly", { cache: "no-store" }), fetch("/api/weekly/events", { cache: "no-store" })]);
    const posts = await postResponse.json().catch(() => ({}));
    const report = await statResponse.json().catch(() => ({}));
    if (!postResponse.ok) return setNotice(posts.error || "WEEKLY 목록을 불러오지 못했습니다.");
    setItems(posts.items || []); setStats(report.stats || {});
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);

  async function edit(row: WeeklyRow) {
    setForm({ id: row.id, issueNumber: String(row.issue_number), slug: row.slug, title: row.title, summary: row.summary,
      oneIssueTitle: row.one_issue_title, body: row.body, onMessage: row.on_message,
      playerKey: row.team_id && row.player_id ? `${row.team_id}|${row.player_id}` : "", published: row.published, coverUrl: row.coverUrl || "" });
    setCover(null); setPendingImages([]); setExistingImages([]); setNotice("");
    const response = await fetch(`/api/weekly/images?weeklyId=${encodeURIComponent(row.id)}`, { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (response.ok) setExistingImages(payload.items || []);
  }

  function chooseBodyImages(files: FileList | null) {
    const selected = Array.from(files || []);
    if (existingImages.length + pendingImages.length + selected.length > 8) return setNotice("본문 사진은 기존 사진을 포함해 최대 8장까지 등록할 수 있습니다.");
    if (selected.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 4 * 1024 * 1024)) return setNotice("본문 사진은 JPG·PNG·WEBP, 장당 최대 4MB까지 가능합니다.");
    setPendingImages((current) => [...current, ...selected.map((file) => ({ key: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`, file, caption: "", afterParagraph: paragraphCount }))]);
    setNotice("");
  }

  async function removeExistingImage(id: string) {
    if (!window.confirm("이 본문 사진을 삭제할까요?")) return;
    const response = await fetch(`/api/weekly/images?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return setNotice(payload.error || "사진을 삭제하지 못했습니다.");
    setExistingImages((current) => current.filter((image) => image.id !== id));
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
    if (!response.ok) { setBusy(false); return setNotice(payload.error || "WEEKLY를 저장하지 못했습니다."); }
    const weeklyId = String(payload.id || form.id);
    for (const image of existingImages) {
      const imageResponse = await fetch("/api/weekly/images", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: image.id, caption: image.caption, afterParagraph: Math.min(image.after_paragraph, paragraphCount) }) });
      if (!imageResponse.ok) { setBusy(false); return setNotice("글은 저장했지만 기존 사진의 위치를 저장하지 못했습니다."); }
    }
    for (let index = 0; index < pendingImages.length; index += 1) {
      const image = pendingImages[index];
      const imageData = new FormData(); imageData.set("weeklyId", weeklyId); imageData.set("file", image.file); imageData.set("caption", image.caption); imageData.set("afterParagraph", String(Math.min(image.afterParagraph, paragraphCount)));
      const imageResponse = await fetch("/api/weekly/images", { method: "POST", body: imageData });
      const imagePayload = await imageResponse.json().catch(() => ({}));
      if (!imageResponse.ok) {
        setForm((current) => ({ ...current, id: weeklyId }));
        setPendingImages(pendingImages.slice(index));
        const savedImages = await fetch(`/api/weekly/images?weeklyId=${encodeURIComponent(weeklyId)}`, { cache: "no-store" });
        const savedPayload = await savedImages.json().catch(() => ({}));
        if (savedImages.ok) setExistingImages(savedPayload.items || []);
        setBusy(false);
        return setNotice(`글은 저장했습니다. ${index + 1}번째 사진부터 다시 저장해 주세요. ${imagePayload.error || ""}`);
      }
    }
    setBusy(false); setNotice(form.published ? "WEEKLY와 본문 사진을 공개했습니다." : "글과 본문 사진을 임시저장했습니다."); setForm(empty); setCover(null); setExistingImages([]); setPendingImages([]); await load();
  }

  return <section className="weekly-admin" aria-labelledby="weekly-admin-title">
    <div className="member-admin-heading"><div><h3 id="weekly-admin-title">AMAON WEEKLY 관리</h3><p>제목과 본문만으로도 공개할 수 있습니다. 선수와 대표 이미지는 필요한 글에만 선택하세요.</p></div><a href="/weekly" target="_blank" rel="noreferrer">공개 화면 보기 ↗</a></div>
    <form className="weekly-admin-form" onSubmit={save}>
      <div className="weekly-admin-row"><label>회차<input type="number" min="1" max="999" required value={form.issueNumber} onChange={(e) => setForm({ ...form, issueNumber: e.target.value })} /></label><label>영문 주소<input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })} placeholder="offseason-baseball-player" /></label></div>
      <label>제목<input required minLength={2} maxLength={120} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
      <label>한 줄 요약<textarea required minLength={10} maxLength={240} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></label>
      <label>PLAYER · 이번 주 선수 (선택)<select value={form.playerKey} onChange={(e) => setForm({ ...form, playerKey: e.target.value })}><option value="">선수 소개 없이 발행</option>{sortedPlayers.map((player) => <option key={`${player.teamId}-${player.playerId}`} value={`${player.teamId}|${player.playerId}`}>{player.school} · {player.name} · {player.position}</option>)}</select></label>
      <label>ONE ISSUE · 소제목<input required minLength={2} maxLength={100} value={form.oneIssueTitle} onChange={(e) => setForm({ ...form, oneIssueTitle: e.target.value })} /></label>
      <label>본문<textarea className="weekly-admin-body" required minLength={20} maxLength={5000} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="문단 사이를 한 줄 비워 작성하세요." /></label>
      <fieldset className={imageStyles.field}><legend>본문 사진 (선택 · 최대 8장)</legend><p>사진마다 어느 문단 뒤에 표시할지 고를 수 있습니다.</p>
        {[...existingImages].sort((a, b) => a.sort_order - b.sort_order).map((image) => <div className={imageStyles.row} key={image.id}><Image src={image.imageUrl} alt="등록된 본문 사진 미리보기" width={90} height={68} unoptimized /><input aria-label="사진 설명" value={image.caption} maxLength={160} placeholder="사진 설명 (선택)" onChange={(e) => setExistingImages((current) => current.map((item) => item.id === image.id ? { ...item, caption: e.target.value } : item))} /><select aria-label="사진 위치" value={Math.min(image.after_paragraph, paragraphCount)} onChange={(e) => setExistingImages((current) => current.map((item) => item.id === image.id ? { ...item, after_paragraph: Number(e.target.value) } : item))}><option value={0}>본문 시작 전</option>{Array.from({ length: paragraphCount }, (_, index) => <option value={index + 1} key={index + 1}>{index + 1}번째 문단 뒤</option>)}</select><button type="button" onClick={() => void removeExistingImage(image.id)}>삭제</button></div>)}
        {pendingImages.map((image) => <div className={`${imageStyles.row} ${imageStyles.pending}`} key={image.key}><span>{image.file.name}</span><input aria-label="새 사진 설명" value={image.caption} maxLength={160} placeholder="사진 설명 (선택)" onChange={(e) => setPendingImages((current) => current.map((item) => item.key === image.key ? { ...item, caption: e.target.value } : item))} /><select aria-label="새 사진 위치" value={image.afterParagraph} onChange={(e) => setPendingImages((current) => current.map((item) => item.key === image.key ? { ...item, afterParagraph: Number(e.target.value) } : item))}><option value={0}>본문 시작 전</option>{Array.from({ length: paragraphCount }, (_, index) => <option value={index + 1} key={index + 1}>{index + 1}번째 문단 뒤</option>)}</select><button type="button" onClick={() => setPendingImages((current) => current.filter((item) => item.key !== image.key))}>제외</button></div>)}
        {existingImages.length + pendingImages.length < 8 && <label className={imageStyles.picker}>+ 본문 사진 선택<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => { chooseBodyImages(e.target.files); e.currentTarget.value = ""; }} /></label>}
        <small>{existingImages.length + pendingImages.length}/8장 · 사진당 최대 4MB</small>
      </fieldset>
      <label>ON · 행동 문구<input required minLength={2} maxLength={160} value={form.onMessage} onChange={(e) => setForm({ ...form, onMessage: e.target.value })} /></label>
      <label>대표 이미지 (선택 · 없으면 아마ON 기본 이미지)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setCover(e.target.files?.[0] || null)} />{form.coverUrl && <small>현재 이미지 등록됨 · 새 파일을 고르면 교체됩니다.</small>}</label>
      <label className="weekly-admin-publish"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> 지금 공개하기</label>
      <div className="weekly-admin-buttons"><button disabled={busy}>{busy ? "글·사진 저장 중…" : form.published ? "저장하고 공개" : "임시저장"}</button>{form.id && <button type="button" onClick={() => { setForm(empty); setCover(null); setExistingImages([]); setPendingImages([]); }}>새 글 작성</button>}</div>
      {notice && <p className="weekly-admin-notice" role="status">{notice}</p>}
    </form>
    <div className="weekly-admin-list">{items.map((row) => { const report = stats[row.id]; return <article key={row.id}>
      <div><small>#{String(row.issue_number).padStart(2, "0")} · {row.published ? "공개" : "임시저장"}</small><strong>{row.title}</strong><span>{row.school_name && row.player_name ? `${row.school_name} · ${row.player_name}` : "소개 선수 미선택"}</span></div>
      <p><b>{report?.pageViews || 0}</b> 조회 · 프로필 <b>{report?.playerProfile || 0}</b> · 영상 <b>{report?.playerVideo || 0}</b> · 등록 <b>{report?.profileSubmission || 0}</b></p>
      <button type="button" onClick={() => void edit(row)}>수정</button>
    </article>; })}</div>
  </section>;
}
