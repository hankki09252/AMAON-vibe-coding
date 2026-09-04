"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import * as tus from "tus-js-client";

type PlayerOption = { sectionId: string; school: string; player: { id: string; name: string; number: string; position: string; grade: string; year?: number; height?: number; weight?: number; batsThrows?: string } };
type SubmissionMode = "video" | "profile_photo" | "photo" | "profile";
type UploadTicket = { submissionId: string; storageKey: string; token: string; uploadEndpoint: string };
type UploadTicketResponse = UploadTicket & { tickets?: UploadTicket[]; error?: string };
type ProfileForm = { year: string; number: string; grade: string; position: string; height: string; weight: string; batsThrows: string; introduction: string; strengths: string; aspiration: string };

const categoryLabels = { batting: "타격", fielding: "수비", pitching: "투구" } as const;
const modeLabels: Record<SubmissionMode, { title: string; description: string; icon: string }> = {
  video: { title: "선수 영상", description: "투구·타격·수비 영상", icon: "▶" },
  profile_photo: { title: "대표 프로필 사진", description: "선수 카드의 메인 사진", icon: "◎" },
  photo: { title: "경기·훈련 사진", description: "프로필 사진 앨범", icon: "▧" },
  profile: { title: "프로필 내용 수정", description: "소개·장점·목표·신체 정보", icon: "✎" },
};
const maxVideoBytes = 150 * 1024 * 1024;
const maxImageBytes = 12 * 1024 * 1024;
const maxGalleryPhotos = 10;
const emptyProfile: ProfileForm = { year: "", number: "", grade: "", position: "", height: "", weight: "", batsThrows: "", introduction: "", strengths: "", aspiration: "" };

function fileContentType(file: File, mode: SubmissionMode) {
  if (file.type) return file.type.toLowerCase();
  if (mode !== "video") return /\.png$/i.test(file.name) ? "image/png" : /\.webp$/i.test(file.name) ? "image/webp" : "image/jpeg";
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
    video.onloadedmetadata = () => { const duration = video.duration; URL.revokeObjectURL(url); if (Number.isFinite(duration) && duration > 0) resolve(duration); else reject(new Error("영상 길이를 확인할 수 없습니다.")); };
    video.onerror = () => { URL.revokeObjectURL(url); reject(new Error("이 영상 파일을 읽을 수 없습니다.")); };
    video.src = url;
  });
}

function initialProfile(player: PlayerOption["player"]): ProfileForm {
  return { ...emptyProfile, year: String(player.year || 2026), number: player.number || "", grade: player.grade || "", position: player.position || "", height: player.height ? String(player.height) : "", weight: player.weight ? String(player.weight) : "", batsThrows: player.batsThrows || "" };
}

export default function VideoSubmission({ open, players, onClose }: { open: boolean; players: PlayerOption[]; onClose: () => void }) {
  const [mode, setMode] = useState<SubmissionMode>("video");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PlayerOption | null>(null);
  const [category, setCategory] = useState<keyof typeof categoryLabels>("batting");
  const [relationship, setRelationship] = useState<"guardian" | "player">("guardian");
  const [contact, setContact] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [duration, setDuration] = useState(0);
  const [profileForm, setProfileForm] = useState<ProfileForm>(emptyProfile);
  const [consent, setConsent] = useState(false);
  const [socialConsent, setSocialConsent] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const [successId, setSuccessId] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const keyword = query.trim().replace(/\s+/g, "").toLowerCase();
    if (!keyword) return [];
    return players.filter(({ school, player }) => `${school}${player.name}${player.number}`.replace(/\s+/g, "").toLowerCase().includes(keyword)).slice(0, 8);
  }, [players, query]);
  const uploading = progress !== null && progress < 100;
  const needsFile = mode !== "profile";
  const validContent = mode === "profile"
    ? Object.values(profileForm).some((value) => value.trim())
    : mode === "photo" ? photoFiles.length > 0 : Boolean(file && (mode !== "video" || duration));

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape" && !uploading) onClose(); };
    window.addEventListener("keydown", escape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", escape); };
  }, [open, onClose, uploading]);

  function chooseMode(nextMode: SubmissionMode) {
    if (uploading) return;
    setMode(nextMode); setFile(null); setPhotoFiles([]); setDuration(0); setNotice(""); setProgress(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  function choosePlayer(item: PlayerOption) {
    setSelected(item); setQuery(`${item.school} ${item.player.name}`); setProfileForm(initialProfile(item.player));
  }

  async function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files || []);
    const chosen = selectedFiles[0] || null;
    setNotice(""); setFile(null); setPhotoFiles([]); setDuration(0);
    if (!chosen) return;
    if (mode === "photo") {
      if (selectedFiles.length > maxGalleryPhotos) return setNotice(`경기·훈련 사진은 한 번에 최대 ${maxGalleryPhotos}장까지 선택할 수 있습니다.`);
      const invalid = selectedFiles.find((item) => item.size > maxImageBytes || !/^(image\/(jpeg|png|webp))$/.test(fileContentType(item, mode)));
      if (invalid) return setNotice(`${invalid.name}: JPG·PNG·WEBP 형식, 사진당 최대 12MB까지 등록할 수 있습니다.`);
      setPhotoFiles(selectedFiles);
      return;
    }
    const contentType = fileContentType(chosen, mode);
    if (mode === "video") {
      if (chosen.size > maxVideoBytes) return setNotice("영상 용량이 150MB를 넘습니다. 휴대폰에서 앞뒤를 조금 잘라 다시 선택해 주세요.");
      if (!/^(video\/(mp4|quicktime|webm|x-m4v))$/.test(contentType)) return setNotice("MP4, MOV, WEBM 영상만 등록할 수 있습니다.");
      try { const seconds = await readDuration(chosen); if (seconds > 90.5) return setNotice("영상은 90초 이내로 잘라서 등록해 주세요."); setFile(chosen); setDuration(seconds); }
      catch (error) { setNotice(error instanceof Error ? error.message : "영상 정보를 확인하지 못했습니다."); }
      return;
    }
    if (chosen.size > maxImageBytes) return setNotice("사진 용량은 최대 12MB입니다.");
    if (!/^(image\/(jpeg|png|webp))$/.test(contentType)) return setNotice("JPG, PNG, WEBP 사진만 등록할 수 있습니다.");
    setFile(chosen);
  }

  async function upload(ticket: UploadTicket, source: File, contentType: string, onProgress: (ratio: number) => void) {
    await new Promise<void>((resolve, reject) => {
      const task = new tus.Upload(source, { endpoint: ticket.uploadEndpoint, retryDelays: [0, 1000, 3000, 5000, 10000], headers: { "x-signature": ticket.token }, uploadDataDuringCreation: true, removeFingerprintOnSuccess: true, chunkSize: 6 * 1024 * 1024, metadata: { bucketName: "media", objectName: ticket.storageKey, contentType, cacheControl: "3600" }, onError: reject, onProgress: (uploaded, total) => onProgress(uploaded / total), onSuccess: () => resolve() });
      task.start();
    });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!selected || !validContent || !contact.trim() || !consent || uploading) return setNotice("선수, 등록 내용, 연락처와 필수 동의를 모두 확인해 주세요.");
    setNotice(""); setSuccessId(""); setProgress(needsFile ? 0 : null);
    try {
      const isVideo = mode === "video";
      const endpoint = isVideo ? "/api/video-submissions" : "/api/player-submissions";
      const contentType = file ? fileContentType(file, mode) : "application/json";
      const requestBody = isVideo
        ? { teamId: selected.sectionId, playerId: selected.player.id, category, relationship, contact: contact.trim(), consent, socialConsent, fileName: file!.name, fileSize: file!.size, durationSeconds: duration, contentType }
        : { teamId: selected.sectionId, playerId: selected.player.id, submissionType: mode, relationship, contact: contact.trim(), consent, socialConsent, profileData: profileForm, fileName: file?.name, fileSize: file?.size, contentType, files: mode === "photo" ? photoFiles.map((item) => ({ fileName: item.name, fileSize: item.size, contentType: fileContentType(item, mode) })) : undefined };
      const ticketResponse = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(requestBody) });
      const ticket = await ticketResponse.json().catch(() => ({})) as UploadTicketResponse;
      if (!ticketResponse.ok) throw new Error(ticket.error || "등록 요청을 시작하지 못했습니다.");
      if (needsFile) {
        const sources = mode === "photo" ? photoFiles : file ? [file] : [];
        const tickets = mode === "photo" ? ticket.tickets || [] : [ticket];
        if (!sources.length || tickets.length !== sources.length || tickets.some((item) => !item.token)) throw new Error("업로드 정보를 받지 못했습니다.");
        for (let index = 0; index < sources.length; index += 1) {
          const source = sources[index];
          const currentTicket = tickets[index];
          await upload(currentTicket, source, fileContentType(source, mode), (ratio) => setProgress(Math.min(98, Math.round(((index + ratio) / sources.length) * 98))));
          const completeResponse = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "complete", submissionId: currentTicket.submissionId }) });
          const complete = await completeResponse.json().catch(() => ({})) as { error?: string };
          if (!completeResponse.ok) throw new Error(complete.error || `${index + 1}번째 사진의 업로드 완료를 확인하지 못했습니다.`);
        }
        setProgress(100);
      }
      setSuccessId(ticket.submissionId.slice(0, 8).toUpperCase());
    } catch (error) { setProgress(null); setNotice(error instanceof Error ? error.message : "등록 중 오류가 발생했습니다."); }
  }

  function resetAndClose() {
    if (uploading) return;
    onClose();
    window.setTimeout(() => { setMode("video"); setQuery(""); setSelected(null); setFile(null); setPhotoFiles([]); setDuration(0); setProfileForm(emptyProfile); setContact(""); setConsent(false); setSocialConsent(false); setNotice(""); setProgress(null); setSuccessId(""); }, 250);
  }

  if (!open) return null;
  const activeLabel = modeLabels[mode].title;
  return <section className="video-submit-modal" role="dialog" aria-modal="true" aria-labelledby="video-submit-title"><button type="button" className="video-submit-backdrop" aria-label="등록 창 닫기" onClick={resetAndClose} /><div className="video-submit-sheet">
    <header><div><small>AMAON PROFILE REQUEST</small><h2 id="video-submit-title">선수 프로필 등록·수정</h2><p>필요한 항목 하나만 간단히 보내주세요. 운영팀 확인 후 공개됩니다.</p></div><button type="button" onClick={resetAndClose} disabled={uploading} aria-label="닫기">×</button></header>
    {successId ? <div className="video-submit-success"><span>✓</span><h3>{activeLabel} 접수가 완료되었습니다</h3><p>운영팀이 확인한 뒤 선수 프로필에 반영합니다.</p><small>접수번호 {successId}</small><button type="button" onClick={resetAndClose}>확인</button></div> : <form onSubmit={submit}>
      <section className="video-submit-step"><b>01</b><div><h3>무엇을 등록할까요?</h3><p>한 번에 필요한 항목 하나만 선택하세요.</p><div className="player-submit-modes">{(Object.keys(modeLabels) as SubmissionMode[]).map((value) => <button type="button" className={mode === value ? "active" : ""} key={value} onClick={() => chooseMode(value)}><span>{modeLabels[value].icon}</span><strong>{modeLabels[value].title}</strong><small>{modeLabels[value].description}</small></button>)}</div></div></section>
      <section className="video-submit-step"><b>02</b><div><h3>선수 찾기</h3><p>학교명 또는 선수 이름을 입력하세요.</p><input value={query} onChange={(event) => { setQuery(event.target.value); setSelected(null); }} placeholder="학교명 또는 선수명 입력" aria-label="등록할 선수 검색" />{selected ? <button className="video-submit-selected" type="button" onClick={() => { setSelected(null); setQuery(""); setProfileForm(emptyProfile); }}><strong>{selected.player.number} {selected.player.name}</strong><span>{selected.school} · {selected.player.position} · {selected.player.grade}</span><em>다시 선택</em></button> : results.length > 0 && <div className="video-submit-results">{results.map((item) => <button type="button" key={`${item.sectionId}-${item.player.id}`} onClick={() => choosePlayer(item)}><strong>{item.player.name}</strong><span>{item.school} · {item.player.position} · {item.player.grade}</span><em>{item.player.number}</em></button>)}</div>}</div></section>
      <section className="video-submit-step"><b>03</b><div><h3>{activeLabel}</h3>{mode === "video" && <><p>90초 이내 · 최대 150MB · MP4/MOV/WEBM</p><div className="video-submit-category">{Object.entries(categoryLabels).map(([value, label]) => <button type="button" className={category === value ? "active" : ""} key={value} onClick={() => setCategory(value as keyof typeof categoryLabels)}>{label}</button>)}</div></>}{(mode === "profile_photo" || mode === "photo") && <p>JPG·PNG·WEBP · 사진당 최대 12MB {mode === "profile_photo" ? "· 새 사진이 대표사진으로 표시됩니다." : "· 한 번에 최대 10장까지 선택할 수 있습니다."}</p>}{needsFile && <><input ref={fileInput} hidden type="file" multiple={mode === "photo"} accept={mode === "video" ? "video/mp4,video/quicktime,video/webm,.m4v" : "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"} onChange={chooseFile} /><button className={`video-submit-file${file || photoFiles.length ? " ready" : ""}`} type="button" onClick={() => fileInput.current?.click()}><span>{file || photoFiles.length ? "✓" : "+"}</span><strong>{mode === "photo" && photoFiles.length ? `${photoFiles.length}장 선택됨` : file ? file.name : mode === "video" ? "휴대폰에서 영상 선택" : mode === "photo" ? "휴대폰에서 사진 여러 장 선택" : "휴대폰에서 사진 선택"}</strong>{mode === "photo" && photoFiles.length ? <small>총 {(photoFiles.reduce((sum, item) => sum + item.size, 0) / 1024 / 1024).toFixed(1)}MB · 다시 눌러 변경</small> : file && <small>{(file.size / 1024 / 1024).toFixed(1)}MB{mode === "video" ? ` · ${Math.ceil(duration)}초` : ""}</small>}</button></>}{mode === "profile" && <ProfileFields value={profileForm} onChange={setProfileForm} />}</div></section>
      <section className="video-submit-step"><b>04</b><div><h3>연락처와 동의</h3><p>확인 결과를 안내받을 연락처를 남겨주세요.</p><div className="video-submit-relationship"><button type="button" className={relationship === "guardian" ? "active" : ""} onClick={() => setRelationship("guardian")}>보호자</button><button type="button" className={relationship === "player" ? "active" : ""} onClick={() => setRelationship("player")}>선수 본인</button></div><input value={contact} onChange={(event) => setContact(event.target.value)} maxLength={80} placeholder="휴대폰 번호 또는 카카오톡 ID" aria-label="연락처" /><label className="video-submit-consent"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>필수 · 본인은 선수 또는 보호자이며, 제출 내용의 아마ON 공개와 운영팀 확인·편집에 동의합니다.</span></label><label className="video-submit-consent optional"><input type="checkbox" checked={socialConsent} onChange={(event) => setSocialConsent(event.target.checked)} /><span>선택 · 한끼방패 공식 인스타그램 등 SNS에서 제출 자료를 편집·게시하는 데 동의합니다.</span></label></div></section>
      {notice && <p className="video-submit-notice" role="alert">{notice}</p>}{progress !== null && <div className="video-submit-progress" aria-live="polite"><span style={{ width: `${progress}%` }} /><strong>{progress < 100 ? `안전하게 업로드 중 ${progress}%` : "업로드 완료"}</strong></div>}<button className="video-submit-primary" disabled={uploading || !selected || !validContent || !contact.trim() || !consent}>{uploading ? "파일을 올리고 있습니다…" : "운영팀에 승인 요청"}</button><small className="video-submit-policy">승인 전에는 사이트에 공개되지 않습니다. 부적절하거나 선수 관계가 확인되지 않는 요청은 반려되며 파일은 삭제됩니다.</small>
    </form>}
  </div></section>;
}

function ProfileFields({ value, onChange }: { value: ProfileForm; onChange: (next: ProfileForm) => void }) {
  const set = (key: keyof ProfileForm, next: string) => onChange({ ...value, [key]: next });
  return <div className="player-profile-request-fields"><p>바꿀 내용만 입력해도 됩니다. 운영팀이 기존 프로필과 비교해 반영합니다.</p><div className="compact"><label>기준 연도<input inputMode="numeric" value={value.year} maxLength={4} onChange={(event) => set("year", event.target.value.replace(/\D/g, ""))} /></label><label>등번호<input inputMode="numeric" value={value.number} maxLength={3} onChange={(event) => set("number", event.target.value.replace(/\D/g, ""))} /></label><label>학년<select value={value.grade} onChange={(event) => set("grade", event.target.value)}><option value="">선택</option><option>1학년</option><option>2학년</option><option>3학년</option><option>졸업</option></select></label><label>포지션<input value={value.position} maxLength={20} onChange={(event) => set("position", event.target.value)} /></label><label>키(cm)<input inputMode="numeric" value={value.height} maxLength={3} onChange={(event) => set("height", event.target.value.replace(/\D/g, ""))} /></label><label>몸무게(kg)<input inputMode="numeric" value={value.weight} maxLength={3} onChange={(event) => set("weight", event.target.value.replace(/\D/g, ""))} /></label><label>투타<input value={value.batsThrows} maxLength={20} placeholder="예: 우투우타" onChange={(event) => set("batsThrows", event.target.value)} /></label></div><label>자기소개 <small>{value.introduction.length}/500</small><textarea value={value.introduction} maxLength={500} rows={3} placeholder="성격, 야구를 시작한 계기, 플레이 스타일" onChange={(event) => set("introduction", event.target.value)} /></label><label>나의 장점 <small>{value.strengths.length}/300</small><textarea value={value.strengths} maxLength={300} rows={3} placeholder="주루, 장타력, 제구력, 수비 범위 등" onChange={(event) => set("strengths", event.target.value)} /></label><label>목표와 포부 <small>{value.aspiration.length}/300</small><textarea value={value.aspiration} maxLength={300} rows={3} placeholder="앞으로 이루고 싶은 목표와 각오" onChange={(event) => set("aspiration", event.target.value)} /></label></div>;
}
