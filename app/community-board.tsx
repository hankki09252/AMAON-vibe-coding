"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { COMMUNITY_CATEGORIES, MEMBER_ROLE_LABELS, MEMBER_ROLES, activityLevel } from "./community-model";

type Profile = {
  user_id: string; display_name: string; member_role: string; school_name: string;
  identity_status: string; identityBadge: string; activityLevel: string; activity_points: number;
  isAdmin?: boolean; adminRole?: string;
};
type Post = {
  id: string; author_id: string; category: string; title: string; content: string; created_at: string;
  author?: { display_name: string; member_role: string; identity_status: string; activity_points: number; identity_badge: string } | null;
};
type MemberStats = {
  total: number; verified: number; joinedToday: number;
  roleCounts: Record<string, number>;
};

export default function CommunityBoard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [members, setMembers] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [userId, setUserId] = useState("");
  const [category, setCategory] = useState("free");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [totalMembers, setTotalMembers] = useState(0);

  const categoryLabel = useMemo(() => Object.fromEntries(COMMUNITY_CATEGORIES), []);

  async function load() {
    const [memberResponse, postResponse, statsResponse] = await Promise.all([
      fetch("/api/member-profile", { cache: "no-store" }),
      fetch("/api/community/posts", { cache: "no-store" }),
      fetch("/api/member-stats", { cache: "no-store" }),
    ]);
    const memberPayload = await memberResponse.json().catch(() => ({}));
    const postPayload = await postResponse.json().catch(() => ({}));
    const statsPayload = await statsResponse.json().catch(() => ({}));
    if (memberResponse.ok) {
      setProfile(memberPayload.profile);
      setMembers(memberPayload.members || []);
      setStats(memberPayload.stats || null);
    }
    if (postResponse.ok) {
      setPosts(postPayload.items || []);
      setUserId(postPayload.userId || "");
    }
    if (statsResponse.ok) setTotalMembers(Number(statsPayload.totalMembers || 0));
    const error = memberPayload.error || postPayload.error || statsPayload.error;
    if (error) setNotice(error);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function submitPost(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setNotice("");
    const response = await fetch("/api/community/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category, title, content }) });
    const payload = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) return setNotice(payload.error || "글을 등록하지 못했습니다.");
    setTitle(""); setContent(""); setNotice("게시글을 등록했습니다. 활동 점수 +10");
    await load();
  }

  async function moderate(action: string, post: Post) {
    const reason = action === "report" ? window.prompt("신고 사유를 입력해 주세요.", "부적절한 게시물") : "";
    if (action === "report" && reason === null) return;
    const response = await fetch("/api/community/moderation", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, postId: post.id, blockedUserId: post.author_id, targetUserId: post.author_id, reason }) });
    const payload = await response.json().catch(() => ({}));
    setNotice(response.ok ? action === "block" ? "해당 회원의 글을 차단했습니다." : action === "report" ? "운영팀에 신고했습니다." : "운영 조치를 적용했습니다." : payload.error || "처리하지 못했습니다.");
    if (response.ok) await load();
  }

  async function verify(targetUserId: string, identityStatus: string) {
    const response = await fetch("/api/member-profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ targetUserId, identityStatus }) });
    const payload = await response.json().catch(() => ({}));
    setNotice(response.ok ? "회원 인증 상태를 변경했습니다." : payload.error || "인증 상태를 변경하지 못했습니다.");
    if (response.ok) await load();
  }

  function downloadMembers(role: string = "all") {
    window.location.href = `/api/admin/members-export?role=${encodeURIComponent(role)}`;
  }

  return <section className="community-section" id="community">
    <div className="community-heading">
      <div><p className="kicker"><span /> AMAON COMMUNITY</p><h2>야구로 연결되는<br /><em>우리들의 라커룸</em></h2></div>
      <div className="community-follower-count"><strong>{totalMembers.toLocaleString()}</strong><span>아마ON 팔로워</span><small>회원가입 완료 계정 기준</small></div>
    </div>
    <div className="member-badge-card">
      <div><span className="identity-badge">{profile?.identityBadge || "회원 확인 중"}</span><strong>{profile?.display_name || "아마ON 회원"}</strong><small>{profile?.school_name || "소속 정보 미입력"}</small></div>
      <div><span>활동 등급</span><strong>{profile?.activityLevel || "루키"}</strong><small>{Number(profile?.activity_points || 0).toLocaleString()} P</small></div>
      <p>신원 배지는 운영팀 확인 후 부여되며, 활동 등급과는 별도로 표시됩니다.</p>
      {profile?.isAdmin && <button type="button" onClick={() => setAdminOpen((open) => !open)}>{adminOpen ? "회원 관리 닫기" : "회원 데이터·인증 관리"}</button>}
    </div>
    {adminOpen && profile?.isAdmin && <div className="member-verification-panel">
      <div className="member-admin-heading"><div><h3>회원 데이터 관리</h3><p>회원가입 구분별 현황을 확인하고 엑셀로 내려받을 수 있습니다.</p></div><button type="button" onClick={() => downloadMembers()}>전체 회원 엑셀 다운로드</button></div>
      <div className="member-stat-grid">
        <article><span>전체 회원·팔로워</span><strong>{Number(stats?.total || totalMembers).toLocaleString()}명</strong></article>
        <article><span>신원 인증 완료</span><strong>{Number(stats?.verified || 0).toLocaleString()}명</strong></article>
        <article><span>오늘 가입</span><strong>{Number(stats?.joinedToday || 0).toLocaleString()}명</strong></article>
      </div>
      <div className="member-role-export-grid">{MEMBER_ROLES.map((role) => <button type="button" key={role} onClick={() => downloadMembers(role)}><span>{MEMBER_ROLE_LABELS[role]}</span><strong>{Number(stats?.roleCounts?.[role] || 0).toLocaleString()}명</strong><small>엑셀 받기 ↓</small></button>)}</div>
      <h3>회원 신원 인증</h3>
      {members.filter((member) => !member.isAdmin).map((member) => <div key={member.user_id}>
        <span><strong>{member.display_name}</strong><small>{member.school_name || "소속 미입력"} · {member.identityBadge}</small></span>
        <button onClick={() => verify(member.user_id, "verified")}>인증</button><button onClick={() => verify(member.user_id, "rejected")}>반려</button>
      </div>)}
    </div>}
    <div className="community-layout">
      <form className="community-compose" onSubmit={submitPost}>
        <h3>새 이야기 남기기</h3>
        <label>게시판<select value={category} onChange={(event) => setCategory(event.target.value)}>{COMMUNITY_CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>제목<input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={80} required placeholder="서로를 존중하는 제목을 적어주세요" /></label>
        <label>내용<textarea value={content} onChange={(event) => setContent(event.target.value)} maxLength={2000} required placeholder="선수 개인정보, 연락처, 주소, SNS 아이디는 적지 마세요." /></label>
        <button disabled={busy}>{busy ? "등록 중…" : "게시글 등록"}</button>
        {notice && <p className="community-notice">{notice}</p>}
      </form>
      <div className="community-feed">
        <div className="community-tabs">{COMMUNITY_CATEGORIES.map(([value, label]) => <button key={value} className={category === value ? "active" : ""} onClick={() => setCategory(value)}>{label}</button>)}</div>
        {posts.filter((post) => post.category === category).map((post) => {
          const author = post.author;
          const badge = author?.identity_badge || "인증 대기";
          return <article className="community-post" key={post.id}>
            <header><span className="identity-badge small">{badge}</span><strong>{author?.display_name || "아마ON 회원"}</strong><small>{activityLevel(author?.activity_points || 0)} · {new Date(post.created_at).toLocaleDateString("ko-KR")}</small></header>
            <span className="post-category">{categoryLabel[post.category]}</span><h3>{post.title}</h3><p>{post.content}</p>
            <footer>
              {post.author_id !== userId && <><button onClick={() => moderate("report", post)}>신고</button><button onClick={() => moderate("block", post)}>작성자 차단</button></>}
              {profile?.isAdmin && <><button onClick={() => moderate("hide", post)}>운영자 숨김</button><button onClick={() => moderate("suspend", post)}>7일 정지</button></>}
            </footer>
          </article>;
        })}
        {!posts.some((post) => post.category === category) && <div className="community-empty">첫 번째 이야기를 남겨주세요.</div>}
      </div>
    </div>
  </section>;
}

