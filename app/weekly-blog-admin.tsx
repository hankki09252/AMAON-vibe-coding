"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { blogBody, blogUrlFromBody, normalizeNaverBlogUrl } from "./weekly/weekly-blog-link";
import styles from "./weekly-blog-admin.module.css";

type WeeklyRow = { id: string; issue_number: number; slug: string; title: string; summary: string; body: string; coverUrl: string; published: boolean };
type BlogForm = { id: string; issueNumber: number; slug: string; url: string; previewedUrl: string; title: string; summary: string; imageUrl: string; coverUrl: string; published: boolean };
const blank: BlogForm = { id: "", issueNumber: 0, slug: "", url: "", previewedUrl: "", title: "", summary: "", imageUrl: "", coverUrl: "", published: true };

export default function WeeklyBlogAdmin() {
  const router = useRouter();
  const [rows, setRows] = useState<WeeklyRow[]>([]);
  const [form, setForm] = useState<BlogForm>(blank);
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const coverPreviewRef = useRef("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [createdUrl, setCreatedUrl] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/weekly", { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) { setNotice(payload.error || "글 목록을 불러오지 못했습니다."); return; }
    setRows(payload.items || []); setLoaded(true);
  }, []);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  useEffect(() => () => { if (coverPreviewRef.current) URL.revokeObjectURL(coverPreviewRef.current); }, []);

  function chooseCover(file: File | null) {
    if (coverPreviewRef.current) URL.revokeObjectURL(coverPreviewRef.current);
    coverPreviewRef.current = file ? URL.createObjectURL(file) : "";
    setCover(file); setCoverPreview(coverPreviewRef.current);
  }

  function edit(row: WeeklyRow) {
    const url = blogUrlFromBody(row.body);
    if (!url) return;
    setForm({ id: row.id, issueNumber: row.issue_number, slug: row.slug, url, previewedUrl: url, title: row.title, summary: row.summary, imageUrl: "", coverUrl: row.coverUrl || "", published: row.published });
    chooseCover(null); setNotice(""); setManualMode(true); setCreatedUrl("");
    document.getElementById("weekly-blog-import")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function copyAmaonLink(row: WeeklyRow) {
    try {
      await navigator.clipboard.writeText(`https://www.amaon.kr/weekly/${row.slug}`);
      setNotice("아마온 글 주소를 복사했습니다. 스레드 글에 붙여넣으세요.");
    } catch {
      setNotice(`아마온 글 주소: https://www.amaon.kr/weekly/${row.slug}`);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setNotice(""); setCreatedUrl("");
    const normalized = normalizeNaverBlogUrl(form.url);
    if (!normalized) { setNotice("네이버 블로그 게시물 주소를 확인해 주세요."); return; }
    const duplicate = !form.id && rows.find((row) => blogUrlFromBody(row.body) === normalized);
    if (duplicate) {
      setCreatedUrl(duplicate.published ? `https://www.amaon.kr/weekly/${duplicate.slug}` : "");
      setNotice(duplicate.published ? "이미 아마온에 등록된 글입니다. 아래 주소를 스레드에 공유하세요." : "이미 임시저장된 글입니다. 아래 목록에서 수정해 공개하세요.");
      return;
    }
    const nextIssue = form.id ? form.issueNumber : Math.max(0, ...rows.map((row) => row.issue_number)) + 1;
    if (nextIssue > 999) { setNotice("위클리 회차 한도에 도달했습니다."); return; }
    setBusy(true);
    let draft = form;
    if (normalized !== form.previewedUrl) {
      const previewResponse = await fetch("/api/weekly/blog-preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: normalized }) }).catch(() => null);
      const preview = await previewResponse?.json().catch(() => ({})) || {};
      if (!previewResponse?.ok) { setNotice(preview.error || "블로그 링크를 확인하지 못했습니다."); setBusy(false); return; }
      draft = { ...form, url: preview.url, previewedUrl: preview.url, title: preview.title || form.title, summary: preview.summary || form.summary, imageUrl: preview.imageUrl || "" };
      setForm(draft);
    }
    if (!draft.title.trim() || (!cover && !draft.coverUrl && !draft.imageUrl)) {
      setNotice("제목이나 대표 이미지를 자동으로 가져오지 못했습니다. 아래에서 직접 입력해 주세요."); setManualMode(true); setBusy(false); return;
    }
    let file = cover;
    if (!file && !draft.coverUrl && draft.imageUrl) {
      const imageResponse = await fetch(`/api/weekly/blog-preview?image=${encodeURIComponent(draft.imageUrl)}`).catch(() => null);
      if (!imageResponse?.ok) { setNotice("대표 이미지를 저장하지 못했습니다. 아래에서 이미지 파일을 선택해 주세요."); setManualMode(true); setBusy(false); return; }
      const blob = await imageResponse.blob();
      const extension = blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";
      file = new File([blob], `weekly-blog-cover.${extension}`, { type: blob.type });
    }
    const path = new URL(normalized).pathname.slice(1).replace("/", "-").toLowerCase();
    const data = new FormData();
    const slug = draft.slug || `blog-${path}`;
    const fields = { id: draft.id, issueNumber: String(nextIssue), slug, title: draft.title.trim(), summary: draft.summary.trim().length >= 10 ? draft.summary.trim() : "한끼방패 블로그에서 글 전체를 읽어보세요.", oneIssueTitle: "한끼방패 블로그", body: blogBody(normalized), onMessage: "블로그에서 원문 읽기", teamId: "", playerId: "", playerName: "", schoolName: "", position: "", published: String(draft.published) };
    Object.entries(fields).forEach(([key, value]) => data.set(key, value));
    if (file) data.set("cover", file);
    const response = await fetch("/api/weekly", { method: "POST", body: data }).catch(() => null);
    const payload = await response?.json().catch(() => ({})) || {};
    setBusy(false);
    if (!response?.ok) { setNotice(payload.error || "블로그 카드를 저장하지 못했습니다."); return; }
    setForm(blank); chooseCover(null); setManualMode(false); setCreatedUrl(draft.published ? `https://www.amaon.kr/weekly/${slug}` : ""); setNotice(draft.published ? "블로그 글을 아마온 위클리에 등록했습니다. 아래 주소를 스레드에 공유하세요." : "블로그 카드를 임시저장했습니다.");
    await load(); router.refresh();
  }

  const blogRows = rows.filter((row) => blogUrlFromBody(row.body));
  const imagePreview = coverPreview || form.coverUrl || (form.imageUrl ? `/api/weekly/blog-preview?image=${encodeURIComponent(form.imageUrl)}` : "");

  return <section id="weekly-blog-import" className={styles.panel} aria-labelledby="weekly-blog-title">
    <div className={styles.heading}><div><small>BLOG LINK · OPERATOR ONLY</small><h3 id="weekly-blog-title">블로그 링크만 넣으면 위클리 등록</h3><p>네이버 블로그 글 주소를 넣으면 제목·대표 썸네일을 가져와 아마온 위클리에 등록합니다. 만들어진 아마온 주소를 스레드에 공유하세요.</p></div></div>
    <form className={styles.form} onSubmit={(event) => void save(event)}>
      <label>네이버 블로그 게시물 주소<div className={styles.urlRow}><input type="url" required value={form.url} onChange={(event) => { setForm((current) => ({ ...current, url: event.target.value, previewedUrl: "", title: "", summary: "", imageUrl: "", coverUrl: "" })); chooseCover(null); setCreatedUrl(""); }} placeholder="https://blog.naver.com/블로그아이디/게시물번호" /></div></label>
      {manualMode && <><div className={styles.preview}>{imagePreview ? <Image src={imagePreview} alt="블로그 카드 대표 이미지 미리보기" width={320} height={220} unoptimized /> : <span>썸네일 미리보기</span>}<div><strong>{form.title || "블로그 글 제목"}</strong><p>{form.summary || "한 줄 소개가 이곳에 표시됩니다."}</p><small>한끼방패 블로그 · 아마온에서 보기 →</small></div></div>
      <div className={styles.twoColumns}><label>카드 제목<input required minLength={2} maxLength={120} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} /></label><label>대표 이미지 파일 {form.coverUrl ? "(교체 선택)" : "(자동 추출 실패 시 필수)"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => chooseCover(event.target.files?.[0] || null)} /></label></div>
      <label>짧은 소개<textarea maxLength={240} value={form.summary} onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))} /></label>
      <label className={styles.check}><input type="checkbox" checked={form.published} onChange={(event) => setForm((current) => ({ ...current, published: event.target.checked }))} /> 지금 공개하기</label></>}
      <div className={styles.actions}><button type="submit" disabled={busy || !loaded}>{busy ? "블로그 글 등록 중…" : !loaded ? "글 목록 불러오는 중…" : form.id ? "블로그 카드 수정" : "등록하고 아마온 링크 만들기"}</button>{form.id && <button type="button" onClick={() => { setForm(blank); chooseCover(null); setNotice(""); setManualMode(false); setCreatedUrl(""); }}>새 링크 등록</button>}</div>
      {notice && <p className={styles.notice} role="status">{notice}</p>}
      {createdUrl && <div className={styles.created}><a href={createdUrl} target="_blank" rel="noopener noreferrer">{createdUrl}</a><button type="button" onClick={() => void navigator.clipboard.writeText(createdUrl).then(() => setNotice("아마온 링크를 복사했습니다.")).catch(() => setNotice("위 주소를 길게 눌러 복사해 주세요."))}>주소 복사</button></div>}
    </form>
    {blogRows.length > 0 && <div className={styles.list}><h4>등록된 블로그 카드</h4>{blogRows.map((row) => <div key={row.id}><span><strong>{row.title}</strong><small>{row.published ? "공개 중" : "임시저장"}</small></span>{row.published && <button type="button" onClick={() => void copyAmaonLink(row)}>아마온 링크 복사</button>}<button type="button" onClick={() => edit(row)}>수정</button></div>)}</div>}
  </section>;
}
