"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import * as tus from "tus-js-client";

type PlayerOption = {
  sectionId: string;
  school: string;
  player: { id: string; name: string; number: string; position: string; grade: string };
};

type UploadTicket = { submissionId: string; storageKey: string; token: string; uploadEndpoint: string };

const categoryLabels = { batting: "타격", fielding: "수비", pitching: "투구" } as const;
const maxBytes = 150 * 1024 * 1024;

function contentTypeFor(file: File) {
  if (file.type) return file.type.toLowerCase();
  if (/\.mov$/i.test(file.name)) return "video/quicktime";
  if (/\.webm$/i.test(file.name)) return "video/webm";
  if (/\.m4v$/i.test(file.name)) return "video/x-m4v";
  return "video/mp4";
}

function readDuration(file: File) {
  return new Promise<number>((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration = video.duration;
      URL.revokeObjectURL(url);
      if (Number.isFinite(duration) && duration > 0) resolve(duration);
      else reject(new Error("영상 길이를 확인할 수 없습니다."));
    };
    video.onerror = () => { URL.revokeObjectURL(url); reject(new Error("이 영상 파일을 읽을 수 없습니다.")); };
    video.src = url;
  });
}

export default function VideoSubmission({ open, players, onClose }: { open: boolean; players: PlayerOption[]; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PlayerOption | null>(null);
  const [category, setCategory] = useState<keyof typeof categoryLabels>("batting");
  const [relationship, setRelationship] = useState<"guardian" | "player">("guardian");
  const [contact, setContact] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(0);
  const [consent, setConsent] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const [successId, setSuccessId] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const keyword = query.trim().replace(/\s+/g, "").toLowerCase();
    if (keyword.length < 1) return [];
    return players.filter(({ school, player }) => `${school}${player.name}${player.number}`.replace(/\s+/g, "").toLowerCase().includes(keyword)).slice(0, 8);
  }, [players, query]);
  const uploading = progress !== null && progress < 100;

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape" && !uploading) onClose(); };
    window.addEventListener("keydown", escape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", escape); };
  }, [open, onClose, uploading]);

  async function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0] || null;
    setNotice(""); setFile(null); setDuration(0);
    if (!chosen) return;
    if (chosen.size > maxBytes) return setNotice("영상 용량이 150MB를 넘습니다. 휴대폰에서 앞뒤를 조금 잘라 다시 선택해 주세요.");
    if (!/^(video\/(mp4|quicktime|webm|x-m4v))$/.test(contentTypeFor(chosen))) return setNotice("MP4, MOV, WEBM 영상만 등록할 수 있습니다.");
    try {
      const seconds = await readDuration(chosen);
      if (seconds > 90.5) return setNotice("영상은 90초 이내로 잘라서 등록해 주세요.");
      setFile(chosen); setDuration(seconds);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "영상 정보를 확인하지 못했습니다.");
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!selected || !file || !duration || !contact.trim() || !consent || uploading) return setNotice("선수, 영상, 연락처와 동의 항목을 모두 확인해 주세요.");
    setNotice(""); setSuccessId(""); setProgress(0);
    try {
      const contentType = contentTypeFor(file);
      const ticketResponse = await fetch("/api/video-submissions", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ teamId: selected.sectionId, playerId: selected.player.id, category, relationship, contact: contact.trim(), consent, fileName: file.name, fileSize: file.size, durationSeconds: duration, contentType }),
      });
      const ticket = await ticketResponse.json().catch(() => ({})) as UploadTicket & { error?: string };
      if (!ticketResponse.ok || !ticket.token) throw new Error(ticket.error || "업로드를 시작하지 못했습니다.");
      await new Promise<void>((resolve, reject) => {
        const upload = new tus.Upload(file, {
          endpoint: ticket.uploadEndpoint,
          retryDelays: [0, 1000, 3000, 5000, 10000],
          headers: { "x-signature": ticket.token, apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
          uploadDataDuringCreation: true,
          removeFingerprintOnSuccess: true,
          chunkSize: 6 * 1024 * 1024,
          metadata: { bucketName: "media", objectName: ticket.storageKey, contentType, cacheControl: "3600" },
          onError: reject,
          onProgress: (uploaded, total) => setProgress(Math.min(98, Math.round((uploaded / total) * 98))),
          onSuccess: () => resolve(),
        });
        upload.start();
      });
      const completeResponse = await fetch("/api/video-submissions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "complete", submissionId: ticket.submissionId }) });
      const complete = await completeResponse.json().catch(() => ({})) as { error?: string };
      if (!completeResponse.ok) throw new Error(complete.error || "업로드 완료를 확인하지 못했습니다.");
      setProgress(100); setSuccessId(ticket.submissionId.slice(0, 8).toUpperCase());
    } catch (error) {
      setProgress(null);
      setNotice(error instanceof Error ? error.message : "영상 등록 중 오류가 발생했습니다.");
    }
  }

  function resetAndClose() {
    if (uploading) return;
    onClose();
    window.setTimeout(() => { setQuery(""); setSelected(null); setFile(null); setDuration(0); setContact(""); setConsent(false); setNotice(""); setProgress(null); setSuccessId(""); }, 250);
  }

  if (!open) return null;
  return <section className="video-submit-modal" role="dialog" aria-modal="true" aria-labelledby="video-submit-title">
    <button type="button" className="video-submit-backdrop" aria-label="등록 창 닫기" onClick={resetAndClose} />
    <div className="video-submit-sheet">
      <header><div><small>AMAON DIRECT UPLOAD</small><h2 id="video-submit-title">우리 아이 영상 등록하기</h2><p>로그인 없이 영상 하나만 보내주세요. 운영팀 확인 후 선수 프로필에 공개됩니다.</p></div><button type="button" onClick={resetAndClose} disabled={uploading} aria-label="닫기">×</button></header>
      {successId ? <div className="video-submit-success"><span>✓</span><h3>등록 요청이 완료되었습니다</h3><p>운영팀이 영상을 확인한 뒤 선수 프로필에 공개합니다.</p><small>접수번호 {successId}</small><button type="button" onClick={resetAndClose}>확인</button></div> : <form onSubmit={submit}>
        <section className="video-submit-step"><b>01</b><div><h3>선수 찾기</h3><p>학교명 또는 선수 이름을 입력하세요.</p><input value={query} onChange={(event) => { setQuery(event.target.value); setSelected(null); }} placeholder="학교명 또는 선수명 입력" aria-label="등록할 선수 검색" />
          {selected ? <button className="video-submit-selected" type="button" onClick={() => { setSelected(null); setQuery(""); }}><strong>{selected.player.number} {selected.player.name}</strong><span>{selected.school} · {selected.player.position} · {selected.player.grade}</span><em>다시 선택</em></button> : results.length > 0 && <div className="video-submit-results">{results.map((item) => <button type="button" key={`${item.sectionId}-${item.player.id}`} onClick={() => { setSelected(item); setQuery(`${item.school} ${item.player.name}`); }}><strong>{item.player.name}</strong><span>{item.school} · {item.player.position} · {item.player.grade}</span><em>{item.player.number}</em></button>)}</div>}
        </div></section>
        <section className="video-submit-step"><b>02</b><div><h3>영상 선택</h3><p>90초 이내 · 최대 150MB · MP4/MOV/WEBM</p><div className="video-submit-category">{Object.entries(categoryLabels).map(([value, label]) => <button type="button" className={category === value ? "active" : ""} key={value} onClick={() => setCategory(value as keyof typeof categoryLabels)}>{label}</button>)}</div>
          <input ref={fileInput} hidden type="file" accept="video/mp4,video/quicktime,video/webm,.m4v" onChange={chooseFile} />
          <button className={`video-submit-file${file ? " ready" : ""}`} type="button" onClick={() => fileInput.current?.click()}><span>{file ? "✓" : "+"}</span><strong>{file ? file.name : "휴대폰에서 영상 선택"}</strong>{file && <small>{(file.size / 1024 / 1024).toFixed(1)}MB · {Math.ceil(duration)}초</small>}</button>
        </div></section>
        <section className="video-submit-step"><b>03</b><div><h3>연락처와 동의</h3><p>확인 결과를 안내받을 연락처를 남겨주세요.</p><div className="video-submit-relationship"><button type="button" className={relationship === "guardian" ? "active" : ""} onClick={() => setRelationship("guardian")}>보호자</button><button type="button" className={relationship === "player" ? "active" : ""} onClick={() => setRelationship("player")}>선수 본인</button></div><input value={contact} onChange={(event) => setContact(event.target.value)} maxLength={80} placeholder="휴대폰 번호 또는 카카오톡 ID" aria-label="연락처" />
          <label className="video-submit-consent"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>본인은 선수 또는 보호자이며, 영상 공개와 운영팀의 확인·편집에 동의합니다.</span></label>
        </div></section>
        {notice && <p className="video-submit-notice" role="alert">{notice}</p>}
        {progress !== null && <div className="video-submit-progress" aria-live="polite"><span style={{ width: `${progress}%` }} /><strong>{progress < 100 ? `안전하게 업로드 중 ${progress}%` : "업로드 완료"}</strong></div>}
        <button className="video-submit-primary" disabled={uploading || !selected || !file || !contact.trim() || !consent}>{uploading ? "영상을 올리고 있습니다…" : "운영팀에 확인 요청"}</button>
        <small className="video-submit-policy">승인 전 영상은 사이트에 공개되지 않습니다. 부적절하거나 관계가 확인되지 않는 영상은 반려·삭제됩니다.</small>
      </form>}
    </div>
  </section>;
}
