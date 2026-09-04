"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

type Submission = {
  id: string; team_id: string; player_id: string; player_name: string; school_name: string;
  submission_type: "profile" | "profile_photo" | "photo"; relationship: "player" | "guardian";
  contact: string; social_consent: boolean; profile_data: Record<string, string | number>; original_name: string;
  file_size: number; status: "pending" | "approved" | "rejected"; review_reason: string; created_at: string;
  previewUrl: string; downloadUrl: string;
};

const typeLabels = { profile: "프로필 수정", profile_photo: "대표 프로필 사진", photo: "경기·훈련 사진" } as const;
const fieldLabels: Record<string, string> = { year: "기준 연도", number: "등번호", grade: "학년", position: "포지션", height: "키", weight: "몸무게", batsThrows: "투타", introduction: "자기소개", strengths: "나의 장점", aspiration: "목표와 포부" };

export default function PlayerSubmissionAdmin() {
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/player-submissions", { cache: "no-store" });
    const payload = await response.json().catch(() => ({})) as { items?: Submission[]; error?: string };
    setLoading(false);
    if (!response.ok) return setNotice(payload.error || "사진·프로필 요청을 불러오지 못했습니다.");
    setItems(payload.items || []);
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load]);

  async function review(item: Submission, action: "approve" | "reject") {
    const label = typeLabels[item.submission_type];
    const reason = action === "reject" ? window.prompt("반려 사유를 입력해 주세요.", "선수 관계 또는 등록 내용 확인 필요") : "";
    if (action === "reject" && reason === null) return;
    if (action === "approve" && !window.confirm(`${item.school_name} ${item.player_name} 선수의 ${label} 요청을 반영할까요?`)) return;
    setBusyId(item.id); setNotice("");
    const response = await fetch("/api/player-submissions", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ submissionId: item.id, action, reason }) });
    const payload = await response.json().catch(() => ({})) as { error?: string };
    setBusyId("");
    if (!response.ok) return setNotice(payload.error || "요청을 처리하지 못했습니다.");
    setNotice(action === "approve" ? `${label} 승인과 선수 프로필 반영을 완료했습니다.` : "요청을 반려했으며 업로드 파일은 삭제했습니다.");
    await load();
  }

  async function copyProfile(item: Submission) {
    const url = `${window.location.origin}/?team=${encodeURIComponent(item.team_id)}&player=${encodeURIComponent(item.player_id)}#${encodeURIComponent(item.team_id)}`;
    await navigator.clipboard.writeText(url); setNotice(`${item.player_name} 선수 프로필 링크를 복사했습니다.`);
  }

  const pending = items.filter((item) => item.status === "pending");
  const history = items.filter((item) => item.status !== "pending").slice(0, 12);
  return <section className="video-review-panel player-submission-review">
    <div className="member-admin-heading"><div><h3>선수 사진·프로필 승인</h3><p>대표사진, 앨범사진, 프로필 수정 내용을 확인한 뒤 반영하세요.</p></div><button type="button" onClick={() => void load()}>새로고침</button></div>
    <div className="video-review-summary"><strong>{pending.length}</strong><span>확인 대기</span><small>최근 요청 최대 40건 표시</small></div>
    {notice && <p className="member-verification-notice" role="status">{notice}</p>}
    {loading ? <p className="video-review-empty">등록 요청을 불러오는 중입니다.</p> : pending.length ? <div className="video-review-list">{pending.map((item) => <article key={item.id}>
      {item.submission_type === "profile" ? <div className="player-request-profile-mark">PROFILE<br />EDIT</div> : <Image src={item.previewUrl} alt={`${item.player_name} ${typeLabels[item.submission_type]} 미리보기`} width={190} height={132} sizes="(max-width: 720px) 100vw, 190px" />}
      <div><small>{typeLabels[item.submission_type]}{item.file_size ? ` · ${(item.file_size / 1024 / 1024).toFixed(1)}MB` : ""}</small><h4>{item.player_name} <span>{item.school_name}</span></h4><p>{item.relationship === "guardian" ? "보호자" : "선수 본인"} · {item.contact}</p><p className={item.social_consent ? "social-consent yes" : "social-consent"}>{item.social_consent ? "SNS 활용 동의" : "SNS 활용 미동의"}</p>{item.submission_type === "profile" && <dl className="player-request-data">{Object.entries(item.profile_data).map(([key, value]) => <div key={key}><dt>{fieldLabels[key] || key}</dt><dd>{String(value)}{key === "height" ? "cm" : key === "weight" ? "kg" : ""}</dd></div>)}</dl>}<em>{new Date(item.created_at).toLocaleString("ko-KR")}</em></div>
      <div className="video-review-actions">{item.downloadUrl && <a href={item.downloadUrl} target="_blank" rel="noopener noreferrer">원본 받기</a>}<button type="button" disabled={Boolean(busyId)} onClick={() => void review(item, "approve")}>{busyId === item.id ? "처리 중…" : "승인·반영"}</button><button type="button" disabled={Boolean(busyId)} onClick={() => void review(item, "reject")}>반려·삭제</button></div>
    </article>)}</div> : <p className="video-review-empty">현재 확인할 사진·프로필 요청이 없습니다.</p>}
    {history.length > 0 && <details className="video-review-history"><summary>최근 처리 내역 {history.length}건</summary>{history.map((item) => <div key={item.id}><span className={item.status}>{item.status === "approved" ? "승인" : "반려"}</span><strong>{item.school_name} · {item.player_name}</strong><small>{typeLabels[item.submission_type]} · {new Date(item.created_at).toLocaleDateString("ko-KR")}</small>{item.status === "approved" && <button type="button" onClick={() => void copyProfile(item)}>프로필 링크 복사</button>}{item.review_reason && <em>{item.review_reason}</em>}</div>)}</details>}
  </section>;
}
